const express = require('express')
const Message = require('../models/message');
const User = require('../models/user');
const redis = require('redis');
const Queue = require('bull');
const { Pipeline } = require("../Pipeline");
const { joinWordsFilter, toUpperCaseFilter, addFullStopFilter, trimFilter } = require("../filters");
const router = express.Router();

// Redis client and Bull job queue
const redisClient = redis.createClient();
const jobQueue = new Queue('job_queue', { redis: redisClient });

redisClient.on('connect', function() {
  console.log('Connected to Redis');
});

redisClient.on('error', function(err) {
  console.error('Redis error:', err);
});

// Bull job processor
async function jobProcessor(job, done) {
  console.log(`Processing job ${job.id}`);
  const data = job.data;
  console.log(job);
  
  // Apply filters
  var pipeline = new Pipeline();

  pipeline.use(joinWordsFilter);
  pipeline.use(trimFilter);
  pipeline.use(toUpperCaseFilter);
  pipeline.use(addFullStopFilter);

  const result = pipeline.run(data.message);
  
  try {
    const user = await User.findById(data.userId);
    if (!user) {
      throw new Error(`User ${data.userId} not found`);
    }
    const message = new Message({
      jobId: job.id,
      message: result,
      length: result.length,
      owner: user
    });
    await message.save();
  } catch (err) {
    console.log(err);
    done(err);
  }
  console.log(`Job ${job.id} completed`);
  done();
}

// Register the job processor with the job queue
jobQueue.process(jobProcessor);

router.post('/messages', async (req, res) => {
  const { message, userId } = req.body;
  if (!message || !userId) {
    res.status(400).send('Job data is required');
    return;
  }

  // Add the job to the job queue
  const job = await jobQueue.add({message, userId});
  
  res.json({ jobId: job.id });
});

router.get('/messages', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    res.status(400).send('User id is required');
    return;
  }
  try {
    const messages = await Message.find({ owner: userId}).sort({length: 'desc'});
    res.send(messages);
  } catch(e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get('/messages/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).send();
    }
    res.send(message);
  } catch(e) {
    res.status(500).send();
  }
});

router.get('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  const job = await jobQueue.getJob(id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  const state = await job.getState();
  res.json({ state });
});

router.patch('/messages/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const message = await Message.findByIdAndUpdate(id, req.body, {new: true});
    if (!message) {
      return res.status(404).send();
    }
    res.send(message);
  } catch(e) {
    res.status(500).send();
  }
});

router.delete('/messages/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const message = await Message.findByIdAndDelete(id);
    if (!message) {
      return res.status(404).send();
    }
    res.send(message);
  } catch(e) {
    res.status(500).send();
  }
});

module.exports = router;