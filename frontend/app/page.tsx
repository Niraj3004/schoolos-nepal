import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, Calendar, CheckCircle2, CreditCard, GraduationCap, Mountain, ShieldCheck, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground overflow-x-hidden">
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mountain className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold text-primary tracking-tight">SchoolOS Nepal</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#why-us" className="hover:text-primary transition-colors">Why Us?</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary hidden md:block">Log in</Link>
            <Link href="/onboarding">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
          {/* Background image overlay */}
          <div className="absolute inset-0 -z-10">
            <Image 
              src="/hero-bg.jpg" 
              alt="Himalayan Background" 
              fill 
              className="object-cover opacity-10"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
          </div>

          <div className="container mx-auto px-4 text-center">
            <Badge variant="success" className="mb-6 px-3 py-1">🇳🇵 Proudly Made in Nepal</Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold text-primary tracking-tight max-w-4xl mx-auto mb-6">
              Namaste to the Future of <br className="hidden md:block"/> Nepali Education
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              The modern operating system built specifically for schools in Nepal. Manage smart attendance, BS calendars, Nepali GPA, and manual QR fee collections all in one unified platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/onboarding">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-lg group">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>

          {/* Floating Mockup */}
          <div className="mt-16 container mx-auto px-4 relative z-10 perspective-1000">
            <div className="relative mx-auto max-w-5xl rounded-xl border bg-card shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-500">
              <Image 
                src="/mockup.jpg" 
                alt="SchoolOS Dashboard Mockup" 
                width={1200}
                height={675}
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* Trusted By Logos */}
        <section className="py-12 border-y bg-card/50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">Trusted by 500+ forward-thinking schools from Mechi to Mahakali</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
              {/* Dummy logos using text for now */}
              <div className="text-xl font-bold flex items-center gap-2"><Mountain className="h-6 w-6"/> Everest Academy</div>
              <div className="text-xl font-bold flex items-center gap-2"><GraduationCap className="h-6 w-6"/> Annapurna School</div>
              <div className="text-xl font-bold flex items-center gap-2"><Users className="h-6 w-6"/> Lumbini Vidya</div>
              <div className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6"/> Gandaki Boarding</div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Features Tailored for Nepal</h2>
              <p className="text-gray-600 text-lg">We didn't just translate an app; we built SchoolOS from the ground up to solve the unique challenges of the Nepali education system.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <CardTitle>Nepali Grading System</CardTitle>
                  <CardDescription>SEE & NEB Compatible</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Automatically calculate GPA according to the latest Government of Nepal grading scales. Generate beautiful mark ledgers instantly.</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <CardTitle>Manual QR Fee Collection</CardTitle>
                  <CardDescription>eSewa, Khalti & Fonepay</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Parents can upload bank deposit slips or QR payment screenshots. Admins can verify and approve payments with one click.</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <CardTitle>BS / AD Dual Calendar</CardTitle>
                  <CardDescription>Native Bikram Sambat Support</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Manage academic years, holidays, and routines natively in BS without dealing with confusing date conversions.</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-accent/20 text-accent-foreground rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <CardTitle>Smart Attendance</CardTitle>
                  <CardDescription>Real-time Tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Track student and staff attendance using our mobile app. Instantly send SMS notifications to parents for absentees.</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <CardTitle>Parent & Student Portals</CardTitle>
                  <CardDescription>Dedicated Access</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Give parents visibility into homework, attendance, notices, and fee dues through a dedicated, easy-to-use portal.</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <CardTitle>Enterprise Security</CardTitle>
                  <CardDescription>Role-based Access</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Secure multi-tenant architecture ensuring your school's data is isolated, backed up daily, and strictly permission-controlled.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why SchoolOS (Zig-zag) */}
        <section id="why-us" className="py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12 mb-24">
              <div className="flex-1 space-y-6">
                <Badge variant="warning">Efficiency</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Say goodbye to paper registers.</h2>
                <p className="text-lg text-gray-600">
                  Teachers spend hours compiling attendance, creating report cards by hand, and managing homework. SchoolOS automates these administrative tasks so teachers can focus on what matters most: teaching.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="h-5 w-5 text-success" /> Auto-generate Mark Ledgers</li>
                  <li className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="h-5 w-5 text-success" /> Instant SMS for Attendance</li>
                  <li className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="h-5 w-5 text-success" /> Centralized Notice Board</li>
                </ul>
              </div>
              <div className="flex-1 bg-gray-100 rounded-2xl p-8 aspect-video flex items-center justify-center shadow-inner relative overflow-hidden">
                {/* Abstract placeholder for UI graphic */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10"></div>
                <div className="relative z-10 w-full max-w-md space-y-4">
                  <div className="h-12 bg-white rounded-lg shadow w-full animate-pulse"></div>
                  <div className="h-12 bg-white rounded-lg shadow w-5/6 animate-pulse" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-12 bg-white rounded-lg shadow w-4/6 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1 space-y-6">
                <Badge variant="success">Financial Control</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Seamless Fee Management</h2>
                <p className="text-lg text-gray-600">
                  Stop chasing pending fees. Send automated reminders to parents via SMS or the app. Approve Fonepay/eSewa deposit slips instantly from your dashboard.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="h-5 w-5 text-success" /> Automated Fee Invoices</li>
                  <li className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="h-5 w-5 text-success" /> Pending Dues Reminders</li>
                  <li className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="h-5 w-5 text-success" /> Revenue Analytics Dashboard</li>
                </ul>
              </div>
              <div className="flex-1 bg-gray-100 rounded-2xl p-8 aspect-video flex items-center justify-center shadow-inner relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tl from-success/10 to-blue-500/10"></div>
                 <div className="relative z-10 grid grid-cols-2 gap-4 w-full h-full max-h-64">
                    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between">
                      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                      <div className="h-8 w-3/4 bg-success/20 rounded mt-2"></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between">
                      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                      <div className="h-8 w-3/4 bg-warning/20 rounded mt-2"></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <Image src="/hero-bg.jpg" alt="Background" fill className="object-cover grayscale" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <Mountain className="h-12 w-12 text-accent mx-auto mb-8" />
            <blockquote className="text-2xl md:text-4xl font-medium max-w-4xl mx-auto leading-relaxed">
              "Switching to SchoolOS Nepal was the best decision for our institution. The native BS calendar and instant Nepali GPA grading has saved our teachers weeks of administrative work during exam season."
            </blockquote>
            <div className="mt-8">
              <p className="font-bold text-lg text-accent">Ramesh Sharma</p>
              <p className="text-primary-foreground/80">Principal, Valley View Secondary School</p>
            </div>
          </div>
        </section>

        {/* Pricing Tier */}
        <section id="pricing" className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Simple, Transparent Pricing</h2>
              <p className="text-gray-600 text-lg">Choose the plan that best fits your school's size. No hidden setup fees.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Starter */}
              <Card className="border flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">Starter</CardTitle>
                  <CardDescription>For small schools and ECDs</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">रू 15,000</span>
                    <span className="text-gray-500"> /year</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Up to 300 Students</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Basic Attendance</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Mark Ledger Generation</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Email Support</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Choose Starter</Button>
                </CardFooter>
              </Card>

              {/* Growth */}
              <Card className="border-primary border-2 shadow-xl flex flex-col relative transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-bold shadow-md">
                  MOST POPULAR
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Growth</CardTitle>
                  <CardDescription>For standard secondary schools</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">रू 35,000</span>
                    <span className="text-gray-500"> /year</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Up to 1,000 Students</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Smart App Attendance</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Manual QR Fee Collection</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Parent Portals</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Priority Phone Support</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/onboarding" className="w-full">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Start 14-Day Trial</Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Enterprise */}
              <Card className="border flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">Enterprise</CardTitle>
                  <CardDescription>For large colleges and chains</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">Custom</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Unlimited Students</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Custom Domain</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Multi-branch Management</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> API Access</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> 24/7 Dedicated Manager</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Contact Sales</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-accent text-accent-foreground text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Digitize Your School?</h2>
            <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">Join hundreds of schools across Nepal who have modernized their operations with SchoolOS.</p>
            <Link href="/onboarding">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-lg shadow-lg">
                Create Your Account Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card py-12 border-t text-sm">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Mountain className="h-5 w-5 text-accent" />
              <span className="text-lg font-bold text-primary tracking-tight">SchoolOS</span>
            </div>
            <p className="text-gray-500 mb-4">The modern operating system for schools in Nepal.</p>
            <p className="text-gray-400">© 2026 SchoolOS Nepal. All rights reserved.</p>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-4">Product</h4>
            <ul className="space-y-2 text-gray-500">
              <li><Link href="#" className="hover:text-primary">Features</Link></li>
              <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="#" className="hover:text-primary">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-4">Company</h4>
            <ul className="space-y-2 text-gray-500">
              <li><Link href="#" className="hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary">Contact</Link></li>
              <li><Link href="#" className="hover:text-primary">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-500">
              <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </footer>

    </div>
  );
}
