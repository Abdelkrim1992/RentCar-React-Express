import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

const AdminLogin: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { checkAuth } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        setLocation('/admin');
      }
    };
    
    checkAuthentication();
  }, [checkAuth, setLocation]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginValues) => 
      apiRequest('POST', '/api/auth/login', data),
    onSuccess: async () => {
      // Important: Invalidate the auth query to force a refresh
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      // Update auth state with a fresh check
      await checkAuth();
      
      toast({
        title: 'Login successful',
        description: 'Welcome to the admin dashboard',
      });
      
      // Redirect to admin dashboard
      setLocation('/admin');
    },
    onError: (error) => {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
      setIsLoading(false);
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  const onSubmit = (data: LoginValues) => {
    setIsLoading(true);
    loginMutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <span className="font-turret text-4xl font-bold tracking-wider text-black">
              <span className="text-[#6843EC]">ETHER</span>
              <span className="text-[#D2FF3A]">.</span>
            </span>
          </a>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Enter your username"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-[#6843EC] hover:bg-[#6843EC]/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-sm text-gray-500 text-center mt-2">
              <p>For demo purposes use:</p>
              <p className="font-mono bg-gray-100 p-1 rounded mt-1">admin / admin123</p>
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center mt-6">
          <a href="/" className="text-sm text-gray-600 hover:underline">
            Return to Homepage
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;