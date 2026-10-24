import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../shared/api/api-client";
import { useAuthStore } from "../auth/auth.store";
import { Input } from "../../shared/components/ui/Input";
import { Button } from "../../shared/components/ui/Button";
import { VerificationBadge } from "../../shared/components/ui/Badge";
import { Lock, CheckCircle2, Briefcase, GraduationCap } from "lucide-react";
import { getErrorMessage } from "../../shared/utils/errors";

export function VerificationPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const isProvider =
    user?.userType === "provider" || user?.userType === "business";

  // Student Form State
  const [studentId, setStudentId] = useState("");
  const [universityCode, setUniversityCode] = useState("AAU");

  // Provider Form State
  const [nationalId, setNationalId] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState(
    "Electronics & Repairs",
  );

  // Shared Doc State
  const [docUrl, setDocUrl] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data } = useQuery({
    queryKey: ["verification-status"],
    queryFn: async () => {
      const res = await api.get("/verification/status");
      return res.data.data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (isProvider) {
        const res = await api.post("/verification/provider/submit", {
          nationalId,
          businessName,
          businessCategory,
          documentUrl: docUrl || undefined,
        });
        return res.data.data;
      } else {
        const res = await api.post("/verification/student/submit", {
          studentId,
          universityCode,
          documentUrl: docUrl || undefined,
        });
        return res.data.data;
      }
    },
    onSuccess: () => {
      setSuccessMsg(
        isProvider
          ? "Business verification submitted! A campus administrator will review your trade/national ID."
          : "Student verification submitted! A campus administrator will review your student ID.",
      );
      setStudentId("");
      setNationalId("");
      setBusinessName("");
      setBusinessCategory("Electronics & Repairs");
      setDocUrl("");
      queryClient.invalidateQueries({ queryKey: ["verification-status"] });
    },
    onError: (err: any) => {
      setErrorMsg(
        getErrorMessage(err, "Verification submission failed. Please check your inputs.")
      );
    },
  });

  const status =
    data?.verificationStatus || user?.verificationStatus || "unverified";
  const verifications = data?.verifications || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-0.5 text-xs font-semibold mb-1">
          <Lock className="h-3.5 w-3.5 text-emerald-600" />
          <span>AES-256-GCM Secure Campus ID Verification</span>
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">
          Campus Trust & Verification
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isProvider
            ? "Verify your campus service business to offer repairs, tutoring, and certified services."
            : "Verify your student identity to unlock seller privileges and build peer reputation."}
        </p>
      </div>

      {/* Current Status Card */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Current Account Status
          </p>
          <div className="pt-0.5">
            <VerificationBadge status={status} />
          </div>
        </div>

        {status === "verified" && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
            <span>Full Marketplace Privileges Active</span>
          </div>
        )}
      </div>

      {/* Verification Submission Form (if not verified) */}
      {status !== "verified" && (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            {isProvider ? (
              <Briefcase className="h-5 w-5 text-emerald-600" />
            ) : (
              <GraduationCap className="h-5 w-5 text-emerald-600" />
            )}
            <div>
              <h2 className="text-base font-bold text-foreground">
                {isProvider
                  ? "Submit Business & Technician Verification"
                  : "Submit Your Student ID"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your ID is encrypted with AES-256-GCM and reviewed only by
                authorized campus moderators.
              </p>
            </div>
          </div>

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-700 dark:text-red-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setErrorMsg("");
              setSuccessMsg("");
              submitMutation.mutate();
            }}
            className="space-y-4"
          >
            {isProvider ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="National ID or Trade License Number"
                    required
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="e.g. AA123456789 or BL-AA-9988"
                  />

                  <Input
                    label="Business or Service Name"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Ahmed Laptop Repairs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Service Category
                  </label>
                  <select
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Electronics & Repairs">
                      Electronics & Laptop Repairs
                    </option>
                    <option value="Phone Maintenance">
                      Phone Maintenance & Screens
                    </option>
                    <option value="Academic Tutoring">
                      Academic Tutoring & Exam Prep
                    </option>
                    <option value="Campus Printing">
                      Printing & Document Services
                    </option>
                    <option value="Catering & Food">
                      Student Catering & Meal Prep
                    </option>
                    <option value="Campus Transport">
                      Campus Transport & Ride Sharing
                    </option>
                  </select>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Student ID Number"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. UGR/1234/15 or ETR/9900/14"
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    University / Institute
                  </label>
                  <select
                    value={universityCode}
                    onChange={(e) => setUniversityCode(e.target.value)}
                    className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="AAU">Addis Ababa University (AAU)</option>
                    <option value="ASTU">Adama Science & Tech (ASTU)</option>
                    <option value="AASTU">
                      Addis Ababa Science & Tech (AASTU)
                    </option>
                    <option value="HU">Hawassa University (HU)</option>
                    <option value="JU">Jimma University (JU)</option>
                    <option value="BDU">Bahir Dar University (BDU)</option>
                  </select>
                </div>
              </div>
            )}

            <Input
              label="ID Card / License Photo URL"
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              placeholder="https://..."
            />

            <Button
              type="submit"
              size="lg"
              className="w-full font-bold"
              isLoading={submitMutation.isPending}
            >
              Submit for Verification
            </Button>
          </form>
        </div>
      )}

      {/* History of Verifications */}
      {verifications.length > 0 && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-foreground">
            Verification History
          </h3>
          <div className="divide-y divide-border/60">
            {verifications.map((v: any) => (
              <div
                key={v.verificationId}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold uppercase tracking-wider">
                    {v.type.replace("_", " ")}
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Submitted {new Date(v.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <VerificationBadge status={v.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
