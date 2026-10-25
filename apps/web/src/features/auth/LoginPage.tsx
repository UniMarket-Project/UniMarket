import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "./auth.store";
import { Input } from "../../shared/components/ui/Input";
import { Button } from "../../shared/components/ui/Button";
import { GraduationCap } from "lucide-react";
import { getErrorMessage } from "../../shared/utils/errors";

export const DEMO_ACCOUNTS = [
  {
    role: "Abebe (Verified Seller)",
    email: "abebe.bikila@aau.edu.et",
    password: "Password123!",
    tag: "Student Seller",
    color:
      "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300",
  },
  {
    role: "Chaltu (Verified Buyer)",
    email: "chaltu.kebede@aau.edu.et",
    password: "Password123!",
    tag: "Student Buyer",
    color:
      "border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300",
  },
  {
    role: "Tadesse (Repair Tech)",
    email: "tadesse.repair@gmail.com",
    password: "Password123!",
    tag: "Service Provider",
    color:
      "border-teal-500/50 bg-teal-50/50 dark:bg-teal-950/20 text-teal-800 dark:text-teal-300",
  },
  {
    role: "Campus Admin",
    email: "admin@aau.edu.et",
    password: "Password123!",
    tag: "Staff / Admin",
    color:
      "border-purple-500/50 bg-purple-50/50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-300",
  },
  {
    role: "Dawit (Freshman)",
    email: "dawit.alemu@aau.edu.et",
    password: "Password123!",
    tag: "Unverified Demo",
    color:
      "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300",
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setErrorMsg(
        getErrorMessage(err, "Invalid email or password. Please try again.")
      );
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">
          Welcome Back
        </h1>
        <p className="text-xs text-muted-foreground">
          Sign in to your Ethiopian university campus marketplace account
        </p>
      </div>


      {/* Standard Email/Password Form */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-700 dark:text-red-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Campus Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. name@aau.edu.et"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          <Button
            type="submit"
            size="lg"
            className="w-full font-bold"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-emerald-600 font-bold hover:underline"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
