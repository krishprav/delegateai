import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  Dialog,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BACKEND_URL } from "@/config/api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { CredentialsI, CredentialSubmitPayload } from "@delegate/db";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

type CredentialDialogContentProps = {
  credApis: CredentialsI[];
  credName: string;
  currCredApi: CredentialsI | null;
  setCredName: (val: string) => void;
  setCredCurrApi: (val: CredentialsI) => void;
  onSuccess?: () => void;
};

export function CredentialDialogContent({
  credApis,
  credName,
  currCredApi,
  setCredName,
  setCredCurrApi,
  onSuccess,
}: CredentialDialogContentProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isInnerDialogOpen, setIsInnerDialogOpen] = useState(false);

  useEffect(() => {
    if (currCredApi) {
      const initialValues: Record<string, string> = {};
      currCredApi.properties.forEach((prop: any) => {
        initialValues[prop.name] = prop.default ?? "";
      });
      setFormValues(initialValues);
    }
  }, [currCredApi]);

  const handleChange = (field: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!currCredApi) return;

    const payload: CredentialSubmitPayload = {
      name: currCredApi.displayName,
      apiName: currCredApi.name,
      appIcon: currCredApi.iconUrl,
      application: currCredApi.application,
      data: formValues,
    };

    console.log("Submitting payload:", payload);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/cred/create`,
        payload,
        { withCredentials: true }
      );
      console.log("saved", res.data);
      if (res) {
        toast.success("Credentials created successfully");
        setIsInnerDialogOpen(false);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error saving credential:", error);
    }
  };

  return (
    <DialogContent className="w-[40%] bg-[#0A0A0A] border-white/10 text-white">
      <DialogHeader>
        <DialogTitle className="text-white">Add new Credentials</DialogTitle>
        <DialogDescription className="text-white/50">
          <div className="mt-4">
            <Select
              onValueChange={(value) => {
                const selected = credApis.find((c) => c.name === value);
                if (selected) {
                  setCredName(value);
                  setCredCurrApi(selected);
                  setFormValues({});
                }
              }}
            >
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:border-white/20">
                <SelectValue placeholder="Select Credentials" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                {credApis.map((cred) => (
                  <SelectItem key={cred.name} value={cred.name} className="hover:bg-white/10 focus:bg-white/10 focus:text-white hover:text-white cursor-pointer data-[state=checked]:bg-white/10 data-[state=checked]:text-white">
                    {cred.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white">Cancel</Button>
        </DialogClose>

        <Dialog open={isInnerDialogOpen} onOpenChange={setIsInnerDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="cursor-pointer bg-white text-black hover:bg-white/90"
              type="button"
              disabled={!currCredApi}
              onClick={() => {
                const res = credApis.filter(
                  (credApi) => credApi.name === credName
                );
                setCredCurrApi(res[0]);
              }}
            >
              Continue
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-2xl">
            <div className="flex flex-col">
              <div className="flex justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex gap-3 items-center">
                  <div className="bg-white p-1 rounded-md">
                    <img src={currCredApi?.iconUrl} alt="" width={24} height={24} className="object-contain" />
                  </div>
                  <div>
                    <DialogTitle className="text-white">{currCredApi?.displayName}</DialogTitle>
                    <DialogDescription className="text-white/40 text-xs font-mono">
                      {currCredApi?.name}
                    </DialogDescription>
                  </div>
                </div>

                <div>
                  {/* Save button logic is inside DialogFooter generally, but keeping layout as is */}
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-[20%] text-xs flex flex-col gap-2">
                  <div className="bg-white/10 rounded-md px-3 py-2 text-white font-medium text-center">
                    Connections
                  </div>
                </div>
                <div className="flex-1 text-xs space-y-4">
                  <div className="bg-emerald-500/10 py-3 px-4 w-full border-l-2 border-emerald-500 rounded-r-md">
                    <div className="text-emerald-400">
                      Need help? See{" "}
                      <a
                        className="font-bold hover:underline"
                        target="_blank"
                        href={currCredApi?.documentationUrl}
                      >
                        Docs
                      </a>
                    </div>
                  </div>

                  {currCredApi?.name === "gmailOAuth2" && (
                    <div className="my-2">
                      <Button
                        className="w-full bg-white text-black hover:bg-white/90"
                        onClick={() => {
                          window.location.href =
                            `${BACKEND_URL}/api/v1/auth/google`;
                        }}
                      >
                        Sign in with Google
                      </Button>
                    </div>
                  )}

                  {currCredApi?.name === "resendApi" && (
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300">
                      <div className="font-semibold text-indigo-200 mb-2">📧 Quick Setup Guide:</div>
                      <ol className="list-decimal ml-4 space-y-1.5 opacity-80">
                        <li>Sign up at <a href="https://resend.com" target="_blank" className="text-white underline hover:text-indigo-200">resend.com</a></li>
                        <li>Verify your domain in the Resend dashboard</li>
                        <li>Generate an API key from <a href="https://resend.com/api-keys" target="_blank" className="text-white underline hover:text-indigo-200">API Keys</a></li>
                        <li>Paste your API key below</li>
                      </ol>
                      <div className="mt-3 text-[10px] bg-black/20 p-2 rounded text-indigo-200/60">
                        Tip: Use a verified domain for the "From" address when sending emails
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {currCredApi?.properties.map((curr: any) => (
                      <div key={curr.name}>
                        <div className="text-white/70 mb-1.5">{curr.displayName}</div>
                        {curr.type === "string" ? (
                          <Input
                            type="text"
                            placeholder={curr?.placeholder}
                            defaultValue={curr?.default}
                            onChange={(e) =>
                              handleChange(curr.name, e.target.value)
                            }
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-white/20"
                          />
                        ) : curr.type === "options" ? (
                          <select
                            defaultValue={curr?.default}
                            onChange={(e) =>
                              handleChange(curr.name, e.target.value)
                            }
                            className="w-full bg-[#1A1A1A] border border-white/10 text-white px-3 py-2 rounded-md focus:outline-none focus:border-white/20 appearance-none"
                          >
                            {curr.options?.map((opt: any) => (
                              <option
                                className="bg-[#1A1A1A] py-2"
                                key={opt.value}
                                value={opt.value}
                                title={opt.description}
                              >
                                {opt.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div></div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button className="bg-white text-black hover:bg-white/90 px-8" onClick={handleSave}>
                      Save Credential
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogFooter>
    </DialogContent>
  );
}
