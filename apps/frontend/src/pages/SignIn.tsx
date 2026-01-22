import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { BACKEND_URL } from "@/config/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { GoogleSignInButton } from "@/components/GoogleSignInButton"
import { AuroraBackground } from "@/components/AuroraBackground"
import { Logo } from "@/components/Logo"

export function SignIn({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")
      await axios.post(
        `${BACKEND_URL}/api/v1/auth/signin`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      )
      navigate("/dashboard")
    } catch (err: unknown) {
      console.error("Sign in error:", err)
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Sign in failed")
      } else {
        setError("Sign in failed")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuroraBackground>
      <div className={cn("flex flex-col gap-6 w-full max-w-md px-4 py-12", className)} {...props}>
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl w-full max-w-md">
          <Logo className="h-10 w-auto self-center mb-6 mx-auto" />
          <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">Sign in to your account</CardTitle>
            <CardDescription className="text-center text-white/50">
              Enter your email below to Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup className="space-y-4">
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
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password" className="text-white/80">Password</FieldLabel>
                    <Link to="/forgot-password" className="text-sm underline underline-offset-4 text-white/50 hover:text-[#22d3ee] transition-all">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white focus:border-white/20 focus:bg-white/10 transition-all"
                  />
                </Field>
                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>
                )}
                <Field className="space-y-4 pt-2">
                  <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-white/90 font-medium transition-all hover:scale-[1.02]">
                    {loading ? "Signing in..." : "Sign in"}
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
                    text="signin_with"
                    onError={(err) => setError(err)}
                  // Assuming GoogleSignInButton needs props to style it for dark mode or we wrap it
                  // For now, I'll assume it renders a button that might need styling adjustment, 
                  // but usually these components have their own styles. 
                  // If it's a custom component, I might need to check it.
                  />
                  <FieldDescription className="text-center text-white/40 mt-4">
                    Don&apos;t have an account?{" "}
                    <Link to="/signup" className="underline underline-offset-4 text-white hover:text-[#22d3ee] font-bold transition-all">
                      Sign up
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </div>
      </div>
    </AuroraBackground>
  )
}
