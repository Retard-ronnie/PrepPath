"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CalendarDays, 
  Clock, 
  Code, 
  Database, 
  Edit, 
  Layers, 
  Monitor, 
  Play, 
  Settings, 
  MessageCircle,
  Building,
  Briefcase,
  Bell,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface UserInterviewCardProps {
  interview: {
    id: string;
    title: string;
    description?: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    field: "it" | "cs" | "lg" | "other";
    type: string;
    customType?: string;
    status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'expired';
    date: string | number | Date;
    emailNotification?: boolean;
    notes?: string;
    company?: string;
    position?: string;
    createdAt: string | number | Date;
    completedAt?: Date | string; // Add this to detect completed interviews
  };
  onDelete?: (id: string) => void;
}

// Map difficulty to color and label
const difficultyConfig = {
  beginner: { 
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Beginner"
  },
  intermediate: { 
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Intermediate"
  },
  advanced: { 
    color: "bg-red-100 text-red-800 border-red-200",
    label: "Advanced"
  },
};

// Map type to icon and label
const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  frontend: {
    icon: Monitor,
    label: "Frontend",
    color: "text-blue-600"
  },
  backend: {
    icon: Database,
    label: "Backend", 
    color: "text-green-600"
  },
  fullstack: {
    icon: Layers,
    label: "Full Stack",
    color: "text-purple-600"
  },
  devops: {
    icon: Settings,
    label: "DevOps",
    color: "text-orange-600"
  },
  dsa: {
    icon: Code,
    label: "Data Structures & Algorithms",
    color: "text-yellow-600"
  },
  os: {
    icon: Settings,
    label: "Operating Systems",
    color: "text-red-600"
  },
  dbms: {
    icon: Database,
    label: "DBMS",
    color: "text-indigo-600"
  },
  cn: {
    icon: Code,
    label: "Computer Networks",
    color: "text-cyan-600"
  },
  jp: {
    icon: Code,
    label: "Japanese",
    color: "text-rose-600"
  },
  eng: {
    icon: Code,
    label: "English",
    color: "text-emerald-600"
  },
  ben: {
    icon: Code,
    label: "Bengali",
    color: "text-amber-600"
  },
  other: {
    icon: Code,
    label: "Other",
    color: "text-gray-600"
  },
};

// Map field to label
const fieldLabels: Record<string, string> = {
  it: "Information Technology",
  cs: "Computer Science",
  lg: "Languages",
  other: "Other",
};

// Map status to color and label
const statusConfig: Record<string, { color: string; label: string }> = {
  scheduled: { 
    color: "bg-blue-100 text-blue-800 border-blue-200", 
    label: "Scheduled" 
  },
  "in-progress": { 
    color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
    label: "In Progress" 
  },
  completed: { 
    color: "bg-green-100 text-green-800 border-green-200", 
    label: "Completed" 
  },
  cancelled: { 
    color: "bg-gray-100 text-gray-800 border-gray-200", 
    label: "Cancelled" 
  },
  expired: { 
    color: "bg-red-100 text-red-800 border-red-200", 
    label: "Expired" 
  },
};

const UserInterviewCard: React.FC<UserInterviewCardProps> = ({ interview }) => {
  const router = useRouter();
    const difficultyStyle = difficultyConfig[interview.difficulty] || difficultyConfig.beginner;
  const typeInfo = typeConfig[interview.type] || typeConfig.other;
  const TypeIcon = typeInfo?.icon || Code;
  const statusStyle = interview.status ? (statusConfig[interview.status] || statusConfig.scheduled) : statusConfig.scheduled;
    const handleStartInterview = () => {
    router.push(`/interview/${interview.id}`);
  };

  const handleViewAnalysis = () => {
    router.push(`/dashboard/interview/${interview.id}`);
  };

  const handleEdit = () => {
    router.push(`/interview/edit/${interview.id}`);
  };
  const formatDate = (date: string | number | Date) => {
    try {
      // If it's already a Date object
      if (date instanceof Date) {
        return format(date, "MMM d, yyyy");
      }
      
      // Try to create a Date object from the input
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return "Invalid date";
      }
      
      return format(dateObj, "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error, date);
      return "Invalid date";
    }
  };

  const formatTime = (date: string | number | Date) => {
    try {
      // If it's already a Date object
      if (date instanceof Date) {
        return format(date, "h:mm a");
      }
      
      // Try to create a Date object from the input
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return "Invalid time";
      }
      
      return format(dateObj, "h:mm a");
    } catch (error) {
      console.error("Error formatting time:", error, date);
      return "Invalid time";
    }
  };  return (
    <Card className="flex flex-col h-full overflow-hidden border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg group">
      {/* Status Indicator Strip at the top */}
      <div className={`h-1 w-full ${statusStyle?.color || 'bg-gray-100'} transition-all duration-300 group-hover:h-2`}></div>
      
      <div className="grid md:grid-cols-[1fr_auto] border-b">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap gap-2 mb-2">            <Badge variant="outline" className={difficultyStyle?.color || 'bg-gray-100 text-gray-800 border-gray-200'}>
              {difficultyStyle?.label || 'Unknown'}
            </Badge>
              {interview.status && (
              <Badge variant="outline" className={statusStyle?.color || 'bg-gray-100 text-gray-800 border-gray-200'}>
                {statusStyle?.label || 'Unknown'}
              </Badge>
            )}
            
            {interview.emailNotification && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                <Bell className="h-3 w-3 mr-1" />
                Notifications
              </Badge>
            )}
          </div>
          
          <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors duration-200">
            {interview.title}
          </CardTitle>
          
          {interview.description && (
            <CardDescription className="mt-2 line-clamp-2">
              {interview.description}
            </CardDescription>
          )}
        </CardHeader>
        
        <div className="flex flex-col justify-center px-4 py-4 bg-muted/10 border-l">
          <div className="flex items-center text-sm mb-1">
            <div className="bg-primary/10 p-1.5 rounded-md mr-2">
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">
              {formatDate(interview.date)}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <div className="bg-primary/10 p-1.5 rounded-md mr-2">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <span>{formatTime(interview.date)}</span>
          </div>
        </div>
      </div>

      <CardContent className="pt-6 flex-grow">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-3.5">
            {/* Type with enhanced styling */}            <div className="flex items-center gap-2.5 bg-primary/5 p-3 rounded-md hover:bg-primary/10 transition-colors">
              <div className={`rounded-full ${(typeInfo?.color || 'text-gray-600').replace('text-', 'bg-').replace('600', '100')} p-2.5 w-fit shadow-sm`}>
                <TypeIcon className={`h-4.5 w-4.5 ${typeInfo?.color || 'text-gray-600'}`} />
              </div>
              <div>
                <span className="font-medium text-sm block">{typeInfo?.label || 'Unknown'}</span>
                <span className="text-xs text-muted-foreground">{fieldLabels[interview.field] || 'Other'}</span>
              </div>
            </div>
            
            {/* Field - We've incorporated this into the type box above for cleaner design */}
            
            {/* Company and Position in same box if both exist */}
            {(interview.company || interview.position) && (
              <div className="bg-muted/30 p-3 rounded-md hover:bg-muted/40 transition-colors">
                {interview.company && (
                  <div className="flex items-center text-sm mb-2">
                    <Building className="mr-2 h-4 w-4 text-primary/70" />
                    <span className="font-medium">{interview.company}</span>
                  </div>
                )}
                
                {interview.position && (
                  <div className="flex items-center text-sm">
                    <Briefcase className="mr-2 h-4 w-4 text-primary/70" />
                    <span>{interview.position}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Notes with enhanced styling */}
          {interview.notes ? (
            <div className="bg-muted/20 p-4 rounded-md border border-muted/30 hover:border-primary/30 transition-colors">
              <h4 className="text-sm font-medium mb-2.5 flex items-center text-primary/80">
                <MessageCircle className="h-4 w-4 mr-2" />
                Notes
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-4">{interview.notes}</p>
            </div>
          ) : (
            <div className="bg-muted/10 p-4 rounded-md border border-dashed border-muted flex items-center justify-center">
              <p className="text-sm text-muted-foreground italic">No notes added</p>
            </div>
          )}
        </div>

        {/* Created At - Small timestamp at bottom */}
        <div className="mt-5 text-xs text-muted-foreground flex justify-end">
          <span>Created: {formatDate(interview.createdAt)}</span>
        </div>
      </CardContent>
      
      <Separator className="my-1" />
        <CardFooter className="justify-between py-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleEdit}
          className="gap-1.5 hover:bg-muted/20 border-muted/50"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
          {(interview.status === 'completed' || interview.completedAt) ? (
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleViewAnalysis}
            className="bg-blue-600 hover:bg-blue-700 gap-1.5 transition-all duration-200 hover:scale-105 shadow-sm"
          >
            <BarChart3 className="h-4 w-4" />
            Interview Analysis
          </Button>
        ) : (
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleStartInterview}
            className="bg-green-600 hover:bg-green-700 gap-1.5 transition-all duration-200 hover:scale-105 shadow-sm"
          >
            <Play className="h-4 w-4" />
            Start Interview
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default UserInterviewCard;
