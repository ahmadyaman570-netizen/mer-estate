import express from 'express';
import {
  adminDeleteUser,
  deleteUser,
  getAdminUsers,
  test,
  updateUser,
  uploadUserAvatar,
} from '../controllers/user.controller.js';
import { uploadAvatar } from '../middleware/multer.js';
import { verifyAdmin } from '../utils/verifyAdmin.js';
import { verifyUser } from '../utils/verifyUser.js';
const router = express.Router();

router.get('/', test);
router.get('/admin/users', verifyUser, verifyAdmin, getAdminUsers);
router.delete('/admin/users/:id', verifyUser, verifyAdmin, adminDeleteUser);
router.put('/update/:id', verifyUser, updateUser);
router.post('/upload-avatar', verifyUser, uploadAvatar.single('avatar'), uploadUserAvatar);
router.delete('/delete/:id', verifyUser, deleteUser);

export default router;
