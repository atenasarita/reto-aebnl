import { cn } from "../../lib/utils";
import "./shadcn-ui.css";

export function Card({ className, ...props }) {
  return <article className={cn("shadcn-card", className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <header className={cn("shadcn-card-header", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("shadcn-card-title", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("shadcn-card-description", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("shadcn-card-content", className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <footer className={cn("shadcn-card-footer", className)} {...props} />;
}
