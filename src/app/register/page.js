'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bike,
  User,
  Phone,
  FileText,
  Camera,
  Check,
  ArrowLeft,
  ArrowRight,
  Upload,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const steps = ["Personal Details", "Vehicle Details", "Documents", "Review & Submit"];

export default function Register() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    vehicleType: "",
    vehicleNumber: "",
    drivingLicense: null,
    bikePhoto: null,
    numberPlate: null,
    insurance: null,
  });

  const router = useRouter();
  const { register } = useAuth();

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrorMessage(""); // Clear error when user types
  };

  const validateStep = () => {
    setErrorMessage("");

    if (step === 0) {
      if (!form.fullName.trim()) {
        setErrorMessage("Full name is required");
        return false;
      }
      if (!form.firstName.trim()) {
        setErrorMessage("First name is required");
        return false;
      }
      if (!form.email.trim()) {
        setErrorMessage("Email is required");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setErrorMessage("Invalid email format");
        return false;
      }
      if (!form.phone.trim()) {
        setErrorMessage("Phone number is required");
        return false;
      }
      if (!/^\d{10,15}$/.test(form.phone.replace(/\s/g, ""))) {
        setErrorMessage("Phone must be 10-15 digits");
        return false;
      }
      if (!form.password) {
        setErrorMessage("Password is required");
        return false;
      }
      if (form.password.length < 6) {
        setErrorMessage("Password must be at least 6 characters");
        return false;
      }
      if (form.password !== form.confirmPassword) {
        setErrorMessage("Passwords do not match");
        return false;
      }
    }

    if (step === 1) {
      if (!form.vehicleType) {
        setErrorMessage("Vehicle type is required");
        return false;
      }
      if (!form.vehicleNumber.trim()) {
        setErrorMessage("Vehicle number is required");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const registrationData = {
        fullname: form.fullName,
        email: form.email,
        phone: form.phone.replace(/\s/g, ""),
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName || "",
        vehicleType: form.vehicleType,
        vehicleNumber: form.vehicleNumber,
      };

      const response = await register(registrationData);

      setSuccessMessage(response.message || "Registration successful!");
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (error) {
      setErrorMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUploadBox = ({ label, field, icon: Icon }) => {
    const file = form[field];

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>

        <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
          {file ? (
            <div className="flex items-center gap-2 text-primary">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                {file.name}
              </span>
            </div>
          ) : (
            <>
              <Icon className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Tap to upload
              </span>
            </>
          )}

          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) =>
              updateForm(field, e.target.files?.[0] || null)
            }
          />
        </label>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-fade-in">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3">
            <Bike className="w-7 h-7 text-primary" />
          </div>

          <h1 className="text-2xl font-display font-bold text-foreground">
            Join GroFast
          </h1>

          <p className="text-muted-foreground text-sm mt-1">
            Become a delivery partner
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-6 px-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  i <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>

              {i < steps.length - 1 && (
                <div
                  className={`w-8 sm:w-12 h-0.5 mx-1 ${
                    i < step ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="shadow-lg border border-border/50 rounded-xl">

          {/* Title */}
          <div className="p-6 pb-3">
            <h2 className="text-lg font-semibold">
              {steps[step]}
            </h2>
          </div>

          {/* Content */}
          <div className="p-6 pt-0 space-y-4">

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* STEP 1 */}
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={form.fullName}
                      onChange={(e) =>
                        updateForm("fullName", e.target.value)
                      }
                      className="pl-10 w-full border border-border rounded-lg px-3 py-2"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <input
                      value={form.firstName}
                      onChange={(e) =>
                        updateForm("firstName", e.target.value)
                      }
                      className="w-full border border-border rounded-lg px-3 py-2"
                      placeholder="John"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <input
                      value={form.lastName}
                      onChange={(e) =>
                        updateForm("lastName", e.target.value)
                      }
                      className="w-full border border-border rounded-lg px-3 py-2"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        updateForm("email", e.target.value)
                      }
                      className="pl-10 w-full border border-border rounded-lg px-3 py-2"
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        updateForm("phone", e.target.value)
                      }
                      className="pl-10 w-full border border-border rounded-lg px-3 py-2"
                      placeholder="9876543210"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        updateForm("password", e.target.value)
                      }
                      className="pl-10 w-full border border-border rounded-lg px-3 py-2"
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        updateForm("confirmPassword", e.target.value)
                      }
                      className="pl-10 w-full border border-border rounded-lg px-3 py-2"
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Type</label>
                  <select
                    value={form.vehicleType}
                    onChange={(e) =>
                      updateForm("vehicleType", e.target.value)
                    }
                    className="w-full border border-border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select vehicle type</option>
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="car">Car</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Number</label>
                  <input
                    value={form.vehicleNumber}
                    onChange={(e) =>
                      updateForm("vehicleNumber", e.target.value)
                    }
                    className="w-full border border-border rounded-lg px-3 py-2"
                    placeholder="MH12AB1234"
                    required
                  />
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 2 && (
              <>
                <FileUploadBox label="Driving License" field="drivingLicense" icon={FileText} />
                <FileUploadBox label="Bike Photo" field="bikePhoto" icon={Camera} />
                <FileUploadBox label="Number Plate Photo" field="numberPlate" icon={Camera} />
                <FileUploadBox label="Insurance Document" field="insurance" icon={Upload} />
              </>
            )}

            {/* STEP 4 */}
            {step === 3 && (
              <div className="space-y-3">
                <div className="p-4 bg-muted/50 rounded-xl space-y-2 text-sm">
                  <h3 className="font-semibold text-foreground">Personal Details</h3>
                  <p><span className="text-muted-foreground">Name:</span> {form.fullName}</p>
                  <p><span className="text-muted-foreground">Email:</span> {form.email}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {form.phone}</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-xl space-y-2 text-sm">
                  <h3 className="font-semibold text-foreground">Vehicle Details</h3>
                  <p><span className="text-muted-foreground">Type:</span> {form.vehicleType}</p>
                  <p><span className="text-muted-foreground">Number:</span> {form.vehicleNumber}</p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs">
                  <p className="font-medium">Note:</p>
                  <p>Please complete KYC verification after registration to activate your account.</p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              {step > 0 && !isSubmitting && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 border border-border rounded-lg py-2 flex items-center justify-center hover:bg-muted transition-colors"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
              )}

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 flex items-center justify-center hover:bg-primary/90 transition-colors"
                  disabled={isSubmitting}
                >
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}