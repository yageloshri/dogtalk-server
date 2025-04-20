const express = require('express');
const fileUpload = require('express-fileupload');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(fileUpload());
app.use(express.static('public')); // expose output.mp4

app.post('/merge', async (req, res) => {
  if (!req.files || !req.files.video || !req.files.audio) {
    return res.status(400).send('Missing video or audio');
  }

  const videoPath = path.join(__dirname, 'video.mp4');
  const audioPath = path.join(__dirname, 'audio.mp3');
  const outputPath = path.join(__dirname, 'public/output.mp4');

  await req.files.video.mv(videoPath);
  await req.files.audio.mv(audioPath);

  exec(`ffmpeg -i video.mp4 -i audio.mp3 -c:v copy -c:a aac -shortest public/output.mp4`, (err) => {
    if (err) {
      console.error('FFmpeg error:', err);
      return res.status(500).send('Error merging video and audio');
    }

    const url = `${req.protocol}://${req.get('host')}/output.mp4`;
    res.send({ status: 'success', url });
  });
});

app.listen(3000, () => {
  console.log('🐶 DogTalk Server running on port 3000');
});
