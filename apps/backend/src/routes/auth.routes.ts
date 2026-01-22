import { Router } from "express";
import { getUser, handleSignInCallback, logout, signin, signInWithGoogle, signup, verifyGoogleToken } from "../controllers";
import { isLoggedIn } from "../middlewares";

const router = Router();

router.post('/signin', signin )
router.post('/signup', signup)
router.post('/google-verify', verifyGoogleToken)
router.post('/logout', logout)
router.get('/me', isLoggedIn, getUser)
router.get('/google', isLoggedIn, signInWithGoogle)
router.get('/google/callback', isLoggedIn, handleSignInCallback)


export default router