import express from 'express';
import { getUniversitiesList } from '../controllers/adminController';

const router = express.Router();

router.get('/list', getUniversitiesList);

export default router;
