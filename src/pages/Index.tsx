import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Clock, Calendar, DollarSign, Building2, Shield } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Comprehensive employee profiles with all essential information'
    },
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description: 'Session-based attendance with automatic hour calculation'
    },
    {
      icon: Calendar,
      title: 'Leave Management',
      description: 'Complete leave workflow with approval system'
    },
    {
      icon: DollarSign,
      title: 'Payroll Processing',
      description: 'Automated salary calculation based on attendance'
    },
    {
      icon: Building2,
      title: 'Organization Chart',
      description: 'Visual hierarchy of your organization structure'
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure access control with multiple user roles'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
              W
            </div>
            <span className="font-semibold text-foreground">WorkFlow HRMS</span>
          </div>
          <Button onClick={() => navigate('/auth')}>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Modern HR Management
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            A lightweight, scalable HRMS designed for small to mid-sized businesses. 
            Manage your workforce efficiently with our clean, intuitive platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Start Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="p-6 rounded-xl bg-background border border-border hover:shadow-md transition-shadow"
              >
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to streamline your HR?
          </h2>
          <p className="text-muted-foreground mb-8">
            Get started in minutes. No credit card required.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Create Your Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © 2024 WorkFlow HRMS. Built for modern businesses.
        </div>
      </footer>
    </div>
  );
}
