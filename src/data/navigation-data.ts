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
  Cloud,
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
    title: "Platform",
    items: [
      { label: "Home Dashboard", href: "/", icon: Home },
      {
        label: "Cloud × Table Matrix",
        href: "/modern-stack",
        icon: Zap,
        pill: { text: "Matrix", variant: "easy" },
        subItems: [
          { label: "Cloud Matrix", href: "/modern-stack?tab=compatibility" },
          { label: "FinOps Playbooks", href: "/modern-stack?tab=cost" },
          { label: "Modern Blueprints", href: "/modern-stack?tab=blueprints" },
          { label: "Polyglot Matrix", href: "/modern-stack?tab=matrix" },
        ],
      },
      {
        label: "Architecture Scenarios",
        href: "/architecture",
        icon: Layers,
        pill: { text: "3.2k+", variant: "architect" },
        subItems: [
          { label: "System Blueprints", href: "/architecture?tab=scenarios", badge: "3.2k" },
          { label: "Whiteboard Diagrams", href: "/architecture?tab=diagrams", badge: "32" },
          { label: "Python Runbooks", href: "/architecture?tab=python", badge: "42" },
        ],
      },
      { label: "Spark Engine Lab", href: "/spark-engine", icon: Cpu, pill: { text: "Spark", variant: "medium" } },
      {
        label: "DataOps & CI/CD",
        href: "/dataops",
        icon: Workflow,
        pill: { text: "E2E", variant: "info" },
        subItems: [
          { label: "Tool Connectivity", href: "/dataops?tab=connectivity" },
          { label: "CI/CD Pipelines", href: "/dataops?tab=cicd" },
          { label: "Lifecycle Playbook", href: "/dataops?tab=lifecycle" },
          { label: "Architecture Flow", href: "/dataops?tab=diagram" },
        ],
      },
    ],
  },
  {
    title: "Knowledge & Drills",
    items: [
      { label: "Concepts Glossary", href: "/concepts", icon: BookOpen, pill: { text: "660+", variant: "easy" } },
      { label: "Concepts Mind Map", href: "/mindmap", icon: GitBranch, pill: { text: "Tree", variant: "info" } },
      {
        label: "Code Practice",
        href: "/code-practice",
        icon: Code2,
        pill: { text: "Drills", variant: "medium" },
        subItems: [
          { label: "PySpark Drills", href: "/code-practice?db=pyspark", badge: "43" },
          { label: "Spark SQL Drills", href: "/code-practice?db=sparksql", badge: "44" },
          { label: "T-SQL Drills", href: "/code-practice?db=mssql", badge: "35" },
          { label: "Python & Polars", href: "/code-practice?db=python", badge: "42" },
          { label: "Databricks Coding", href: "/code-practice/databricks", badge: "148" },
        ],
      },
      {
        label: "Cheat Sheets",
        href: "/cheat-sheet",
        icon: FileCode2,
        pill: { text: "Sheets", variant: "medium" },
        subItems: [
          { label: "Production Runbooks", href: "/cheat-sheet?tab=runbooks", badge: "69" },
          { label: "Databricks Suites", href: "/cheat-sheet?tab=databricks", badge: "48" },
          { label: "A4 PDF Reference Hub", href: "/cheat-sheet?tab=pdf_hub", badge: "A4" },
        ],
      },
    ],
  },
  {
    title: "Interviews & Roadmaps",
    items: [
      { label: "Question Drill Bank", href: "/qa-prep", icon: MessageSquare, pill: { text: "7.1k+", variant: "hard" } },
      { label: "Target Company Intel", href: "/company-research", icon: Briefcase, pill: { text: "156+", variant: "new" } },
      {
        label: "Guided Learning",
        href: "/guided-learning",
        icon: Route,
        pill: { text: "Tracks", variant: "info" },
        subItems: [
          { label: "Topic Tracks", href: "/guided-learning" },
          { label: "Career Curricula", href: "/learning-paths" },
        ],
      },
      { label: "Career Curricula", href: "/learning-paths", icon: GraduationCap, pill: { text: "Roadmap", variant: "info" } },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "My Studio", href: "/studio", icon: User, pill: { text: "Personal", variant: "info" } },
      { label: "Worker Deployments", href: "/deployments", icon: Cloud, pill: { text: "Isolated", variant: "new" } },
    ],
  },
];

export const ALL_FLAT_PAGES_AND_SUBPAGES: FlatNavPage[] = [
  { id: "home", label: "Home Dashboard", shortLabel: "Home", href: "/", category: "Portal", categoryColor: "blue", icon: Home },
  
  // Learning Journey
  { id: "guided-learning", label: "Guided Topic Tracks", shortLabel: "Topic Tracks", href: "/guided-learning", category: "Journey", categoryColor: "indigo", icon: Route, badge: "Path" },
  { id: "learn", label: "Learning Portal", shortLabel: "Learn", href: "/learn", category: "Journey", categoryColor: "indigo", icon: Route, badge: "Learn" },
  { id: "learning-paths", label: "Career Curricula", shortLabel: "Career Paths", href: "/learning-paths", category: "Journey", categoryColor: "indigo", icon: GraduationCap, badge: "Curricula" },
  
  // Concepts & Foundations (Clubbed)
  { id: "concepts", label: "Concepts Glossary", shortLabel: "Glossary", href: "/concepts", category: "Concepts", categoryColor: "emerald", icon: BookOpen, badge: "Concepts" },
  { id: "mindmap", label: "Concepts Mind Map", shortLabel: "Mind Map", href: "/mindmap", category: "Concepts", categoryColor: "emerald", icon: GitBranch, badge: "Mind Map" },
  { id: "modern-concepts", label: "Core Lakehouse Concepts", shortLabel: "Lakehouse Concepts", href: "/modern-stack?tab=concepts", category: "Concepts", categoryColor: "emerald", icon: Zap, badge: "FinOps" },
  
  // Architecture & Systems (Clubbed)
  { id: "arch-scenarios", label: "System Scenarios", shortLabel: "Scenarios", href: "/architecture?tab=scenarios", category: "Architecture", categoryColor: "purple", icon: Layers, badge: "3.2k+" },
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
  { id: "code-databricks", label: "Databricks Coding Hub", shortLabel: "Databricks", href: "/code-practice/databricks", category: "Coding", categoryColor: "cyan", icon: Terminal, badge: "DBX" },
  { id: "code-matrix", label: "Polyglot Code Matrix", shortLabel: "Polyglot Matrix", href: "/modern-stack?tab=matrix", category: "Coding", categoryColor: "cyan", icon: FileCode2, badge: "Matrix" },
  
  // Visual Blueprints & Diagrams (Clubbed)
  { id: "arch-diagrams", label: "Whiteboard Blueprints", shortLabel: "Blueprints", href: "/architecture?tab=diagrams", category: "Images & Diagrams", categoryColor: "rose", icon: Sparkles, badge: "Visuals" },
  { id: "dataops-diagram", label: "Whiteboard Architecture Flow", shortLabel: "Architecture Flow", href: "/dataops?tab=diagram", category: "Images & Diagrams", categoryColor: "rose", icon: Layers, badge: "Flow" },
  { id: "modern-blueprints", label: "Modern Stack Blueprints", shortLabel: "Stack Blueprints", href: "/modern-stack?tab=blueprints", category: "Images & Diagrams", categoryColor: "rose", icon: Cpu, badge: "Blueprints" },
  
  // Interview Drill Hub / Q&A (Clubbed)
  { id: "qa-prep", label: "Question Drill Bank", shortLabel: "Q&A Drill Bank", href: "/qa-prep", category: "Q&A", categoryColor: "amber", icon: MessageSquare, badge: "7.1k+" },
  { id: "company-research", label: "Target Company Intel", shortLabel: "Company Intel", href: "/company-research", category: "Q&A", categoryColor: "amber", icon: Briefcase, badge: "Intel" },
  
  // Workspace
  { id: "studio", label: "My Studio", shortLabel: "My Studio", href: "/studio", category: "Workspace", categoryColor: "rose", icon: User, badge: "Personal" },
  { id: "deployments", label: "Worker Deployments", shortLabel: "Deployments", href: "/deployments", category: "Workspace", categoryColor: "rose", icon: Cloud, badge: "Workers" },
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
