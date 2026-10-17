import React from "react";
import {
  Home,
  BookOpen,
  FileCode2,
  Layers,
  MessageSquare,
  Compass,
  User,
  Workflow,
  Sparkles,
  Terminal,
  Database,
  Network,
  GitBranch,
  ShieldCheck,
  Cpu,
  Route,
  Activity,
  Code2,
  GraduationCap,
  Briefcase,
  Zap,
} from "lucide-react";

export interface SubNavItem {
  label: string;
  href: string;
  badge?: string;
  icon?: React.ElementType;
}

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  pill?: { text: string; variant: "easy" | "medium" | "hard" | "architect" | "new" | "info" };
  matches?: string[];
  subItems?: SubNavItem[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface FlatNavPage {
  id: string;
  label: string;
  shortLabel: string;
  href: string;
  category: string;
  categoryColor: string;
  icon: React.ElementType;
  badge?: string;
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Portal",
    items: [
      { label: "Home Dashboard", href: "/", icon: Home },
    ],
  },
  {
    title: "Academy Pillars",
    items: [
      {
        label: "Concepts & Foundations",
        href: "/concepts",
        icon: BookOpen,
        pill: { text: "Foundations", variant: "easy" },
        matches: ["/concepts", "/mindmap"],
        subItems: [
          { label: "Concepts Glossary", href: "/concepts", icon: BookOpen, badge: "660+" },
          { label: "Concepts Mind Map", href: "/mindmap", icon: GitBranch, badge: "Tree" },
          { label: "Core Lakehouse Concepts", href: "/modern-stack?tab=concepts", icon: Zap, badge: "FinOps" },
        ],
      },
      {
        label: "Architecture & Systems",
        href: "/architecture",
        icon: Layers,
        pill: { text: "Principal", variant: "architect" },
        matches: ["/architecture", "/spark-engine", "/dataops"],
        subItems: [
          { label: "System Scenarios", href: "/architecture?tab=scenarios", icon: Layers, badge: "3.1k+" },
          { label: "Spark Engine Lab", href: "/spark-engine", icon: Cpu, badge: "Spark" },
          { label: "End-to-End Lifecycle Playbook", href: "/dataops?tab=lifecycle", icon: Workflow, badge: "E2E" },
          { label: "Tool Connectivity & Secrets", href: "/dataops?tab=connectivity", icon: Network, badge: "Secrets" },
          { label: "CI/CD Alternatives & Pipelines", href: "/dataops?tab=cicd", icon: GitBranch, badge: "CI/CD" },
          { label: "Cloud × Table Compatibility", href: "/modern-stack?tab=compatibility", icon: Zap, badge: "Matrix" },
        ],
      },
      {
        label: "Coding & Runbooks",
        href: "/code-practice",
        icon: FileCode2,
        pill: { text: "Prod Ready", variant: "medium" },
        matches: ["/code-practice", "/cheat-sheet"],
        subItems: [
          { label: "Production Cheat Sheet", href: "/cheat-sheet", icon: FileCode2, badge: "Sheet" },
          { label: "Databricks Cheat Sheets", href: "/cheat-sheet?tab=databricks", icon: Terminal, badge: "DBX" },
          { label: "PySpark Drills", href: "/code-practice?db=pyspark", icon: Code2, badge: "PySpark" },
          { label: "Spark SQL Drills", href: "/code-practice?db=sparksql", icon: Database, badge: "SQL" },
          { label: "T-SQL Drills", href: "/code-practice?db=mssql", icon: Database, badge: "T-SQL" },
          { label: "Python & Polars", href: "/code-practice?db=python", icon: Code2, badge: "Python" },
          { label: "Polyglot Code Matrix", href: "/modern-stack?tab=matrix", icon: FileCode2, badge: "Polyglot" },
        ],
      },
      {
        label: "Visual Blueprints & Diagrams",
        href: "/architecture?tab=diagrams",
        icon: Sparkles,
        pill: { text: "32 Visuals", variant: "new" },
        matches: ["/architecture?tab=diagrams", "/dataops?tab=diagram"],
        subItems: [
          { label: "Whiteboard Blueprints", href: "/architecture?tab=diagrams", icon: Sparkles, badge: "32 Visuals" },
          { label: "Whiteboard Architecture Flow", href: "/dataops?tab=diagram", icon: Layers, badge: "Flow" },
          { label: "Modern Stack Blueprints", href: "/modern-stack?tab=blueprints", icon: Cpu, badge: "Blueprints" },
        ],
      },
      {
        label: "Interview Drill Hub",
        href: "/qa-prep",
        icon: MessageSquare,
        pill: { text: "6.5k+ Qs", variant: "hard" },
        matches: ["/qa-prep", "/company-research"],
        subItems: [
          { label: "Question Drill Bank", href: "/qa-prep", icon: MessageSquare, badge: "6.5k+" },
          { label: "Target Company Intel", href: "/company-research", icon: Briefcase, badge: "Intel" },
        ],
      },
      {
        label: "Learning Journey",
        href: "/guided-learning",
        icon: Compass,
        pill: { text: "The Roadmap", variant: "info" },
        matches: ["/guided-learning", "/learning-paths"],
        subItems: [
          { label: "Guided Topic Tracks", href: "/guided-learning", icon: Route, badge: "Topics" },
          { label: "Career Curricula", href: "/learning-paths", icon: GraduationCap, badge: "Paths" },
        ],
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "My Studio", href: "/studio", icon: User, pill: { text: "Personal", variant: "info" } },
    ],
  },
];

export const ALL_FLAT_PAGES_AND_SUBPAGES: FlatNavPage[] = [
  { id: "home", label: "Home Dashboard", shortLabel: "Home", href: "/", category: "Portal", categoryColor: "blue", icon: Home },
  
  // Learning Journey
  { id: "guided-learning", label: "Guided Topic Tracks", shortLabel: "Topic Tracks", href: "/guided-learning", category: "Journey", categoryColor: "indigo", icon: Route, badge: "Path" },
  { id: "learning-paths", label: "Career Curricula", shortLabel: "Career Paths", href: "/learning-paths", category: "Journey", categoryColor: "indigo", icon: GraduationCap, badge: "Curricula" },
  
  // Concepts & Foundations (Clubbed)
  { id: "concepts", label: "Concepts Glossary", shortLabel: "Glossary", href: "/concepts", category: "Concepts", categoryColor: "emerald", icon: BookOpen, badge: "Concepts" },
  { id: "mindmap", label: "Concepts Mind Map", shortLabel: "Mind Map", href: "/mindmap", category: "Concepts", categoryColor: "emerald", icon: GitBranch, badge: "Mind Map" },
  { id: "modern-concepts", label: "Core Lakehouse Concepts", shortLabel: "Lakehouse Concepts", href: "/modern-stack?tab=concepts", category: "Concepts", categoryColor: "emerald", icon: Zap, badge: "FinOps" },
  
  // Architecture & Systems (Clubbed)
  { id: "arch-scenarios", label: "System Scenarios", shortLabel: "Scenarios", href: "/architecture?tab=scenarios", category: "Architecture", categoryColor: "purple", icon: Layers, badge: "3.1k+" },
  { id: "spark-engine", label: "Spark Engine Lab", shortLabel: "Spark Lab", href: "/spark-engine", category: "Architecture", categoryColor: "purple", icon: Cpu, badge: "Lab" },
  { id: "modern-stack", label: "Modern Stack & FinOps", shortLabel: "Modern Stack", href: "/modern-stack", category: "Architecture", categoryColor: "purple", icon: Zap, badge: "FinOps" },
  { id: "modern-compat", label: "Cloud × Table Compatibility", shortLabel: "Cloud Matrix", href: "/modern-stack?tab=compatibility", category: "Architecture", categoryColor: "purple", icon: Zap, badge: "Matrix" },
  { id: "dataops-conn", label: "Tool Connectivity & Secrets", shortLabel: "Tool Secrets", href: "/dataops?tab=connectivity", category: "Architecture", categoryColor: "purple", icon: Network, badge: "Secrets" },
  { id: "dataops-cicd", label: "CI/CD Alternatives & Pipelines", shortLabel: "CI/CD Pipelines", href: "/dataops?tab=cicd", category: "Architecture", categoryColor: "purple", icon: GitBranch, badge: "CI/CD" },
  { id: "dataops-lifecycle", label: "End-to-End Lifecycle Playbook", shortLabel: "Lifecycle Playbook", href: "/dataops?tab=lifecycle", category: "Architecture", categoryColor: "purple", icon: Workflow, badge: "E2E" },
  
  // Coding & Runbooks (Clubbed)
  { id: "cheat-sheet", label: "Production Cheat Sheet", shortLabel: "Cheat Sheet", href: "/cheat-sheet", category: "Coding", categoryColor: "cyan", icon: FileCode2, badge: "Runbooks" },
  { id: "dbx-cheat-sheet", label: "Databricks Cheat Sheets", shortLabel: "DBX Sheets", href: "/cheat-sheet?tab=databricks", category: "Coding", categoryColor: "cyan", icon: Terminal, badge: "DBX" },
  { id: "code-pyspark", label: "PySpark Drills", shortLabel: "PySpark", href: "/code-practice?db=pyspark", category: "Coding", categoryColor: "cyan", icon: Code2, badge: "Python" },
  { id: "code-sparksql", label: "Spark SQL Drills", shortLabel: "Spark SQL", href: "/code-practice?db=sparksql", category: "Coding", categoryColor: "cyan", icon: Database, badge: "SQL" },
  { id: "code-mssql", label: "T-SQL Drills", shortLabel: "T-SQL", href: "/code-practice?db=mssql", category: "Coding", categoryColor: "cyan", icon: Database, badge: "MSSQL" },
  { id: "code-python", label: "Python & Polars", shortLabel: "Python & Polars", href: "/code-practice?db=python", category: "Coding", categoryColor: "cyan", icon: Code2, badge: "Polars" },
  { id: "code-matrix", label: "Polyglot Code Matrix", shortLabel: "Polyglot Matrix", href: "/modern-stack?tab=matrix", category: "Coding", categoryColor: "cyan", icon: FileCode2, badge: "Matrix" },
  
  // Visual Blueprints & Diagrams (Clubbed)
  { id: "arch-diagrams", label: "Whiteboard Blueprints", shortLabel: "Blueprints", href: "/architecture?tab=diagrams", category: "Images & Diagrams", categoryColor: "rose", icon: Sparkles, badge: "Visuals" },
  { id: "dataops-diagram", label: "Whiteboard Architecture Flow", shortLabel: "Architecture Flow", href: "/dataops?tab=diagram", category: "Images & Diagrams", categoryColor: "rose", icon: Layers, badge: "Flow" },
  { id: "modern-blueprints", label: "Modern Stack Blueprints", shortLabel: "Stack Blueprints", href: "/modern-stack?tab=blueprints", category: "Images & Diagrams", categoryColor: "rose", icon: Cpu, badge: "Blueprints" },
  
  // Interview Drill Hub / Q&A (Clubbed)
  { id: "qa-prep", label: "Question Drill Bank", shortLabel: "Q&A Drill Bank", href: "/qa-prep", category: "Q&A", categoryColor: "amber", icon: MessageSquare, badge: "6.5k+" },
  { id: "company-research", label: "Target Company Intel", shortLabel: "Company Intel", href: "/company-research", category: "Q&A", categoryColor: "amber", icon: Briefcase, badge: "Intel" },
  
  // Workspace
  { id: "studio", label: "My Studio", shortLabel: "My Studio", href: "/studio", category: "Workspace", categoryColor: "rose", icon: User, badge: "Personal" },
];

/**
 * Checks if a specific sub-navigation URL is currently active.
 */
export function isSubHrefActive(pathname: string | null, searchParams: URLSearchParams | null, subHref: string): boolean {
  if (!pathname) return false;
  const [subPath, subQuery] = subHref.split("?");
  if (pathname !== subPath) return false;

  if (!subQuery) {
    if (!searchParams) return true;
    const currentTab = searchParams.get("tab");
    const currentDb = searchParams.get("db");
    if (!currentTab && !currentDb) return true;
    return false;
  }

  if (!searchParams) return false;
  const subParams = new URLSearchParams(subQuery);
  for (const [key, val] of subParams.entries()) {
    const currentVal = searchParams.get(key);
    // Defaults for pages without explicit search params in URL
    if (pathname === "/architecture" && key === "tab" && val === "scenarios" && !currentVal) {
      return true;
    }
    if (pathname === "/code-practice" && key === "db" && val === "pyspark" && !currentVal) {
      return true;
    }
    if (pathname === "/dataops" && key === "tab" && val === "connectivity" && !currentVal) {
      return true;
    }
    if (pathname === "/cheat-sheet" && key === "tab" && val === "runbooks" && !currentVal) {
      return true;
    }
    if (pathname === "/modern-stack" && key === "tab" && val === "compatibility" && !currentVal) {
      return true;
    }
    if (currentVal !== val) return false;
  }
  return true;
}
