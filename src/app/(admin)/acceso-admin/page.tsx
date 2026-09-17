import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Panel administrativo</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
