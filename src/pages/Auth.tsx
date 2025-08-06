import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Trees, Mail } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email no confirmado",
            description: "Por favor, revisa tu email y confirma tu cuenta antes de iniciar sesión.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error de acceso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      setPendingVerification(true);
      toast({
        title: "¡Registro exitoso!",
        description: "Hemos enviado un email de confirmación. Por favor, revisa tu bandeja de entrada y confirma tu cuenta.",
      });
    } catch (error: any) {
      toast({
        title: "Error de registro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground">Confirma tu Email</h1>
            <p className="text-muted-foreground">Sistema de Gestión Premium</p>
          </div>

          <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">¡Email Enviado!</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Hemos enviado un enlace de confirmación a <strong>{email}</strong>
                  </p>
                </div>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Por favor:</p>
                  <ol className="list-decimal list-inside space-y-1 text-left">
                    <li>Revisa tu bandeja de entrada (y spam/promociones)</li>
                    <li>Haz clic en el enlace de confirmación</li>
                    <li>Regresa aquí para iniciar sesión</li>
                  </ol>
                </div>
                <Button 
                  onClick={() => setPendingVerification(false)}
                  variant="outline" 
                  className="w-full"
                >
                  Volver al formulario
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Trees className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Palmera Estudio</h1>
          <p className="text-muted-foreground">Sistema de Gestión Premium</p>
        </div>

        <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-md">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-foreground">Acceso al Sistema</CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Gestiona tu centro de manicura y pedicura profesional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="signup">Registrarse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-6 mt-6">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-input-elegant"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-input-elegant pr-10"
                        placeholder="Tu contraseña"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full gradient-primary shadow-elegant text-white font-medium py-3" disabled={loading}>
                    {loading ? 'Accediendo...' : 'Iniciar Sesión'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6 mt-6">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-input-elegant"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="form-input-elegant pr-10"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium">Confirmar Contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="form-input-elegant"
                      placeholder="Repite tu contraseña"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <strong>Importante:</strong> Recibirás un email de confirmación. Debes hacer clic en el enlace antes de poder acceder al sistema.
                  </div>
                  <Button type="submit" className="w-full gradient-primary shadow-elegant text-white font-medium py-3" disabled={loading}>
                    {loading ? 'Registrando...' : 'Crear Cuenta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;