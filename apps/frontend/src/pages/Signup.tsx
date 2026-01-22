import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "@/config/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { AuroraBackground } from "@/components/AuroraBackground";
import { Logo } from "@/components/Logo";

export function Signup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await axios.post(
        `${BACKEND_URL}/api/v1/auth/signup`,
        {
          name: `${firstName} ${lastName}`.trim(),
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );
      navigate("/signin");
    } catch (err: unknown) {
      console.error("Signup error:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Signup failed");
      } else {
        setError("Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground>
      <div className="flex flex-col gap-6 w-full max-w-md px-4 py-12">
        <div className="flex flex-col items-center gap-2">
          <Logo className="h-10 w-auto self-center mb-2" />
        </div>

        <Card className="border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_8px_40px_-12px_rgba(0,0,0,0.8),inset_0_1px_rgba(255,255,255,0.1)] text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">Create an account</CardTitle>
            <CardDescription className="text-center text-white/50">
              Enter your information below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field className="space-y-2">
                    <FieldLabel htmlFor="firstName" className="text-white/80">First Name</FieldLabel>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-white/20 focus:bg-white/10 transition-all"
                    />
                  </Field>
                  <Field className="space-y-2">
                    <FieldLabel htmlFor="lastName" className="text-white/80">Last Name</FieldLabel>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-white/20 focus:bg-white/10 transition-all"
                    />
                  </Field>
                </div>

                <Field className="space-y-2">
                  <FieldLabel htmlFor="email" className="text-white/80">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-white/20 focus:bg-white/10 transition-all"
                  />
                </Field>

                <Field className="space-y-2">
                  <FieldLabel htmlFor="password" className="text-white/80">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white focus:border-white/20 focus:bg-white/10 transition-all"
                  />
                  <FieldDescription className="text-white/40 text-xs">
                    Must be at least 8 characters long.
                  </FieldDescription>
                </Field>

                <Field className="space-y-2">
                  <FieldLabel htmlFor="confirm-password" className="text-white/80">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white focus:border-white/20 focus:bg-white/10 transition-all"
                  />
                </Field>

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>
                )}

                <Field className="space-y-4 pt-2">
                  <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-white/90 font-medium transition-all hover:scale-[1.02]">
                    {loading ? "Creating..." : "Create Account"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#0A0A0A] px-2 text-white/40">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <GoogleSignInButton
                    text="signup_with"
                    onError={(err) => setError(err)}
                  />
                  <FieldDescription className="text-center text-white/40 mt-4">
                    Already have an account?{" "}
                    <Link to="/signin" className="underline underline-offset-4 text-white hover:text-[#22d3ee] font-bold transition-all">
                      Sign in
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuroraBackground>
  );
}

export default Signup;
