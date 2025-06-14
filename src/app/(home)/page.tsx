
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Calendar, Clock, Code, FileText, Layers, Star, UserCheck, Users } from "lucide-react"
import UserInterviewsSection from "@/components/interview/UserInterviewsSection"
import ProfileInsights from "@/components/interview/ProfileInsights"

export default async function HomePage() {
  return (
    <div className="container py-12">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center space-y-8 text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Welcome to PrepPath</h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl">
          Your all-in-one platform for preparation and progress tracking
        </p>          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Button size="lg" asChild>
            <a href="/auth/signup">Get Started</a>
          </Button>
          <Button size="lg" variant="outline">Learn More</Button>
        </div>      </div>      {/* Main Content Section */}
      <div className="space-y-12">
        {/* AI Profile Insights */}
        <ProfileInsights />

        {/* User Created Interviews */}
        <UserInterviewsSection />

        {/* Pre-built Interview Cards */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Pre-built Interview Cards</h2>
            <Button variant="ghost" className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="flex flex-col h-full border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="rounded-md bg-primary/10 p-2 w-fit mb-3">
                      <Code className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Technical Interview</CardTitle>
                    <CardDescription className="mt-1">
                      Coding challenges and algorithmic problem-solving
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-6 flex-grow">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>45 minutes</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>3 difficulty levels</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>5,234 attempts</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button className="w-full">Start Practice</Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col h-full border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="rounded-md bg-primary/10 p-2 w-fit mb-3">
                      <UserCheck className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Behavioral Interview</CardTitle>
                    <CardDescription className="mt-1">
                      STAR method responses and situation handling
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-6 flex-grow">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>30 minutes</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>25 common questions</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>3,789 attempts</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button className="w-full">Start Practice</Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col h-full border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="rounded-md bg-primary/10 p-2 w-fit mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-primary"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M3 9h18" />
                        <path d="M9 21V9" />
                      </svg>
                    </div>
                    <CardTitle>System Design</CardTitle>
                    <CardDescription className="mt-1">
                      Architecture design and scalability challenges
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-6 flex-grow">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>60 minutes</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Advanced level</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>2,156 attempts</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button className="w-full">Start Practice</Button>
              </CardFooter>
            </Card>
          </div>
        </section>        {/* Featured Practice Sessions */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Featured Practice Sessions</h2>
            <Button variant="ghost" className="gap-1">
              Browse all <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="popular" className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="newest">Newest</TabsTrigger>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="popular" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Featured Session 1 */}
                <Card className="hover:border-primary/50 transition-colors border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className="rounded-md bg-primary/10 p-2">
                        <Star className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base">FAANG Interview Prep</CardTitle>
                        <CardDescription>Comprehensive interview preparation for top tech companies</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>8 hours</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        <span>12.5k users</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full">View Session</Button>
                  </CardFooter>
                </Card>

                {/* Featured Session 2 */}
                <Card className="hover:border-primary/50 transition-colors border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className="rounded-md bg-primary/10 p-2">
                        <Code className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base">Data Structures & Algorithms</CardTitle>
                        <CardDescription>Master the core concepts with practical examples</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>12 hours</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        <span>18.3k users</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full">View Session</Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="newest" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:border-primary/50 transition-colors border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className="rounded-md bg-primary/10 p-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5 text-primary"
                        >
                          <path d="M20.2 7.8l-7.7 7.7-4-4-5.7 5.7" />
                          <path d="M15 7h6v6" />
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <CardTitle className="text-base">Machine Learning Interview</CardTitle>
                          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">NEW</span>
                        </div>
                        <CardDescription>Specialized ML algorithm and model design questions</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>6 hours</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>Added 2 days ago</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full">View Session</Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recommended" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:border-primary/50 transition-colors border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className="rounded-md bg-primary/10 p-2">
                        <UserCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base">Leadership & Soft Skills</CardTitle>
                        <CardDescription>Perfect for senior roles and management positions</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>4 hours</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="mr-1 h-3 w-3 text-yellow-500" />
                        <span>4.9 (423 reviews)</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full">View Session</Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>        {/* Recent Activities */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Recent Activities</h2>
            <Button variant="ghost" className="gap-1">
              See all <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <CardTitle>Quick Access</CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Activity Item 1 */}
              <Card className="border shadow-none hover:bg-accent/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-md bg-primary/10 p-2">
                      <Code className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">Frontend Interview Practice</p>
                      <p className="text-sm text-muted-foreground mt-1">Completed 3 of 10 exercises</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 text-sm text-muted-foreground">30%</div>
                    <Button size="sm" variant="outline">Continue</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Item 2 */}
              <Card className="border shadow-none hover:bg-accent/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-md bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">Behavioral Questions</p>
                      <p className="text-sm text-muted-foreground mt-1">Last practiced 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 text-sm text-muted-foreground">65%</div>
                    <Button size="sm" variant="outline">Continue</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Item 3 */}
              <Card className="border shadow-none hover:bg-accent/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-md bg-primary/10 p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-primary"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M3 9h18" />
                        <path d="M9 21V9" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">System Design Challenge</p>
                      <p className="text-sm text-muted-foreground mt-1">Started 1 week ago</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 text-sm text-muted-foreground">15%</div>
                    <Button size="sm" variant="outline">Continue</Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="outline" className="w-full">View All Activities</Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  )
}




