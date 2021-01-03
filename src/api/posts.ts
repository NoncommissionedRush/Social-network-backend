import express from 'express';
const router = express.Router();

//@route    GET api/posts
//@desc     posts route
//@access   public
router.get('/', (_req, res) => res.send('posts route'))

module.exports = router;