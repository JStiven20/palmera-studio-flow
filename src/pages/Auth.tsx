import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Trees, UserPlus, LogIn } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [manicuristName, setManicuristName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
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
        title: "¡Bienvenida!",
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
    
    if (!fullName || !manicuristName) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, completa todos los campos.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            manicurist_name: manicuristName,
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Email ya registrado",
            description: "Este email ya está registrado. Intenta iniciar sesión.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "¡Registro exitoso!",
        description: "Cuenta creada correctamente. Ya puedes iniciar sesión.",
      });
      
      // Cambiar a modo login después del registro
      setIsSignUp(false);
      setFullName('');
      setManicuristName('');
    } catch (error: any) {
      toast({
        title: "Error en el registro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


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
            <CardTitle className="text-2xl font-bold text-foreground">
              {isSignUp ? 'Registro de Manicurista' : 'Acceso al Sistema'}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              {isSignUp 
                ? 'Crear nueva cuenta de manicurista' 
                : 'Solo manicuristas autorizadas - Sistema privado y seguro'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-6">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">Nombre Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="form-input-elegant"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manicuristName" className="text-sm font-medium">Nombre de Manicurista</Label>
                    <Input
                      id="manicuristName"
                      type="text"
                      value={manicuristName}
                      onChange={(e) => setManicuristName(e.target.value)}
                      required
                      className="form-input-elegant"
                      placeholder="Nombre que aparecerá en los registros"
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input-elegant"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
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
                {loading ? (isSignUp ? 'Registrando...' : 'Accediendo...') : (
                  <>
                    {isSignUp ? <UserPlus className="w-4 h-4 mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                    {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                  </>
                )}
              </Button>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setFullName('');
                    setManicuristName('');
                    setEmail('');
                    setPassword('');
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {isSignUp 
                    ? '¿Ya tienes cuenta? Iniciar sesión' 
                    : '¿Nueva manicurista? Crear cuenta'
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;