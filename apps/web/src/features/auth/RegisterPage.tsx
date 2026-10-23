import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "./auth.store";
import { Input } from "../../shared/components/ui/Input";
import { Button } from "../../shared/components/ui/Button";
import { GraduationCap } from "lucide-react";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+2519");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"student" | "provider" | "staff">(
    "student",
  );
  const [universityCode, setUniversityCode] = useState("AAU");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await register({
        firstName,
        lastName,
        email,
        phone,
        password,
        userType,
        universityCode,
      });
      navigate("/");
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        "Registration failed. Please check inputs.";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">
          Create an Account
        </h1>
        <p className="text-xs text-muted-foreground">
          Join your university campus marketplace community
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-700 dark:text-red-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Abebe"
            />
            <Input
              label="Last Name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Bikila"
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. student@aau.edu.et"
          />

          <Input
            label="Ethiopian Phone Number"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+251911223344"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Campus / University:
            </label>
            <select
              value={universityCode}
              onChange={(e) => setUniversityCode(e.target.value)}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="AAU">
                AAU - Addis Ababa University (All Campuses)
              </option>
              <option value="ASTU">
                ASTU - Adama Science and Technology University
              </option>
              <option value="AASTU">
                AASTU - Addis Ababa Science and Technology University
              </option>
              <option value="HU">HU - Hawassa University</option>
              <option value="JU">JU - Jimma University</option>
              <option value="BDU">BDU - Bahir Dar University</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              I am joining as:
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as any)}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="student">University Student</option>
              <option value="provider">
                Campus Technician / Service Provider
              </option>
              <option value="staff">University Staff</option>
            </select>
          </div>

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 chars with 1 uppercase, number & symbol"
          />

          <Button
            type="submit"
            size="lg"
            className="w-full font-bold"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-emerald-600 font-bold hover:underline"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
