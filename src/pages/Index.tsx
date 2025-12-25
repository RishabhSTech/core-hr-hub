import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  Building2, 
  Shield,
  CheckCircle2,
  XCircle,
  BarChart3,
  FileText,
  UserCheck,
  GitBranch,
  Zap,
  Lock,
  Headphones,
  ChevronRight
} from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const painPoints = [
    {
      icon: XCircle,
      title: 'Payroll errors every month',
      description: 'Manual calculations lead to costly mistakes and unhappy employees'
    },
    {
      icon: XCircle,
      title: 'Attendance data scattered',
      description: 'Multiple tools, spreadsheets, and no single source of truth'
    },
    {
      icon: XCircle,
      title: 'Manual leave approvals',
      description: 'Endless back-and-forth emails and lost requests'
    },
    {
      icon: XCircle,
      title: 'No visibility into team structure',
      description: 'Who reports to whom? Nobody really knows'
    },
    {
      icon: XCircle,
      title: 'Excel sheets breaking',
      description: 'As your team grows, spreadsheets become unmanageable'
    },
    {
      icon: XCircle,
      title: 'HR buried in admin work',
      description: 'More time managing data than actually helping people'
    },
  ];

  const solutions = [
    {
      pain: 'Payroll errors',
      solution: 'Automated payroll based on real attendance data',
      icon: DollarSign
    },
    {
      pain: 'Scattered attendance',
      solution: 'Smart session-based sign-in/sign-out tracking',
      icon: Clock
    },
    {
      pain: 'Manual approvals',
      solution: 'One-click leave workflows with manager approvals',
      icon: Calendar
    },
    {
      pain: 'No visibility',
      solution: 'Role-based dashboards for Owner, HR & Employees',
      icon: BarChart3
    },
    {
      pain: 'Growing pains',
      solution: 'Org chart & hierarchy management that scales',
      icon: GitBranch
    },
    {
      pain: 'Data chaos',
      solution: 'Secure employee profiles with payroll-ready data',
      icon: FileText
    },
  ];

  const features = [
    {
      icon: DollarSign,
      title: 'Payroll Automation',
      description: 'Calculate salaries based on attendance, leaves, and custom deductions. Export-ready reports.',
      highlight: 'Save 10+ hours/month'
    },
    {
      icon: Clock,
      title: 'Attendance Calendar',
      description: 'Session-based tracking with visual calendar view. Real-time status updates.',
      highlight: 'Real-time tracking'
    },
    {
      icon: Calendar,
      title: 'Leave Management',
      description: 'Request, approve, and track leaves with balance visibility. Manager workflows built-in.',
      highlight: 'Zero manual follow-ups'
    },
    {
      icon: Users,
      title: 'Employee Profiles',
      description: 'Complete employee database with bank details, documents, and salary information.',
      highlight: 'Single source of truth'
    },
    {
      icon: GitBranch,
      title: 'Org Chart & Hierarchy',
      description: 'Visual organization structure. Define reporting lines and departments.',
      highlight: 'Clear accountability'
    },
    {
      icon: BarChart3,
      title: 'Owner Dashboard',
      description: 'Bird\'s-eye view of headcount, payroll costs, attendance trends, and pending actions.',
      highlight: 'Data-driven decisions'
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Set up your company',
      description: 'Add company details, departments, and invite your team in minutes'
    },
    {
      number: '02',
      title: 'Track daily operations',
      description: 'Employees sign in/out, request leaves, and managers approve with one click'
    },
    {
      number: '03',
      title: 'Run accurate payroll',
      description: 'Generate payroll based on real data. Export, review, and pay with confidence'
    },
  ];

  const plans = [
    {
      name: 'Starter',
      price: '₹0',
      period: '/month',
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 10 employees',
        'Basic attendance tracking',
        'Employee profiles',
        'Leave management',
        'Email support'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Growth',
      price: '₹49',
      period: '/employee/month',
      description: 'For growing teams that need automation',
      features: [
        'Up to 100 employees',
        'Payroll automation',
        'Manager workflows',
        'Department management',
        'Org chart',
        'Priority support',
        'Custom leave policies'
      ],
      cta: 'Start 14-Day Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For organizations with advanced needs',
      features: [
        'Unlimited employees',
        'Custom integrations',
        'Advanced reporting',
        'Compliance tools',
        'Dedicated account manager',
        'SLA guarantee',
        'Custom workflows'
      ],
      cta: 'Contact Sales',
      popular: false
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
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              W
            </div>
            <span className="font-semibold text-lg text-foreground">WorkFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/super-admin/login">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => navigate('/select-company')}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate('/register-company')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                <Zap className="h-3 w-3 mr-2" />
                Built for modern teams
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                All-in-One HRMS & Payroll That{' '}
                <span className="text-primary">Actually Works</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Stop managing HR the hard way. Automate attendance, streamline leaves, 
                and run accurate payroll—all in one platform built for growing teams.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate('/register-company')} className="text-base">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/select-company')} className="text-base">
                  <Building2 className="mr-2 h-5 w-5" />
                  Sign In to Your Company
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">14-day free trial</span>
                </div>
              </div>
            </div>
            
            {/* Hero Visual - Dashboard Mockup */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-3xl" />
              <div className="relative bg-card border border-border rounded-2xl shadow-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Dashboard Overview</p>
                      <p className="text-sm text-muted-foreground">December 2024</p>
                    </div>
                  </div>
                  <Badge variant="outline">Live</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <p className="text-2xl font-bold text-foreground">24</p>
                    <p className="text-xs text-muted-foreground">Employees</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <p className="text-2xl font-bold text-primary">96%</p>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <p className="text-2xl font-bold text-foreground">₹4.2L</p>
                    <p className="text-xs text-muted-foreground">Payroll</p>
                  </div>
                </div>
                <div className="h-32 bg-background rounded-lg border border-border flex items-end p-4 gap-2">
                  {[40, 65, 55, 80, 70, 90, 85].map((height, i) => (
                    <div key={i} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${height}%` }}>
                      <div className="w-full bg-primary rounded-t" style={{ height: '60%' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 px-4 bg-card border-y border-border">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Sound Familiar?
            </h2>
            <p className="text-lg text-muted-foreground">
              If you're still managing HR with spreadsheets and manual processes, 
              you're not alone—but there's a better way.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {painPoints.map((point, index) => (
              <Card key={index} className="bg-background border-border hover:border-destructive/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
                      <point.icon className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{point.title}</h3>
                      <p className="text-sm text-muted-foreground">{point.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">The Solution</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              We Built WorkFlow to Fix This
            </h2>
            <p className="text-lg text-muted-foreground">
              Every pain point mapped to a solution. No more workarounds.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((item, index) => (
              <Card key={index} className="bg-card border-border overflow-hidden group hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground line-through">{item.pain}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="font-medium text-foreground">{item.solution}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-card border-y border-border">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Run HR Like a Pro
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed for real-world HR challenges.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-background border-border overflow-hidden group hover:shadow-lg transition-all">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs">{feature.highlight}</Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Up and Running in Minutes
            </h2>
            <p className="text-lg text-muted-foreground">
              No complex setup. No training required. Just sign up and go.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary font-bold text-2xl mb-6">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 h-6 w-6 text-muted-foreground" />
                )}
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-card border-y border-border">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative bg-background border-2 ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4 pt-8">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/register-company')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Bank-Grade Security</h3>
              <p className="text-sm text-muted-foreground">
                Your data is encrypted at rest and in transit. We follow industry-best security practices.
              </p>
            </div>
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
                <UserCheck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Built for Compliance</h3>
              <p className="text-sm text-muted-foreground">
                Designed with Indian labor laws in mind. PF, ESI, PT calculations built-in.
              </p>
            </div>
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
                <Headphones className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Dedicated Support</h3>
              <p className="text-sm text-muted-foreground">
                Real humans, fast responses. We're here to help you succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-secondary p-12 md:p-20 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-foreground">
                Stop Managing HR the Hard Way
              </h2>
              <p className="text-lg text-secondary-foreground/80 max-w-xl mx-auto">
                Join growing companies that trust WorkFlow to handle their HR operations. 
                Start your free trial today—no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="outline" className="bg-background text-foreground hover:bg-background/90 border-0" onClick={() => navigate('/register-company')}>
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="ghost" className="text-secondary-foreground hover:bg-secondary-foreground/10" onClick={() => navigate('/select-company')}>
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                W
              </div>
              <span className="font-semibold text-foreground">WorkFlow HRMS</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WorkFlow HRMS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
