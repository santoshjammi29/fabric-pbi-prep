import React from "react";
import { cn } from "@/lib/utils";

interface TopicIconProps {
  topicKey: string;
  size?: number;
  className?: string;
}

export function TopicIcon({ topicKey, size = 18, className }: TopicIconProps) {
  const normKey = (topicKey || "").toLowerCase().trim();

  // 1. Apache Spark: Signature red-orange flame burst
  if (normKey === "spark") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-label="Apache Spark"
      >
        <defs>
          <linearGradient id="sparkFlame" x1="4" y1="20" x2="20" y2="4" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F97316" />
            <stop offset="0.6" stopColor="#E11D48" />
            <stop offset="1" stopColor="#FACC15" />
          </linearGradient>
        </defs>
        {/* Main flame */}
        <path
          d="M12 2C12 2 13.5 5 11.5 7.5C9.8 9.5 8 11.2 8 14C8 17.3 10.7 20 14 20C17.3 20 20 17.3 20 14C20 9.8 15.5 7.2 15.5 7.2C15.5 7.2 16.8 9.5 15 11C13.5 12.3 12 11.5 12 11.5C12 11.5 13.8 9.2 14.2 7.2C14.7 5.2 12 2 12 2Z"
          fill="url(#sparkFlame)"
        />
        {/* Spark core */}
        <path
          d="M10 14.5C10 16.4 11.6 18 13.5 18C15.4 18 17 16.4 17 14.5C17 12.2 14.5 11 14.5 11C14.5 11 15 12.2 14 13C13.2 13.6 12.2 13 12.2 13C12.2 13 13 12 12.5 10.8C11.5 12 10 13.2 10 14.5Z"
          fill="#FEF08A"
        />
        {/* Radiating micro sparks */}
        <circle cx="5" cy="11" r="1.2" fill="#F59E0B" />
        <circle cx="6.5" cy="6.5" r="1" fill="#F97316" />
        <circle cx="18.5" cy="7" r="1.2" fill="#FBBF24" />
      </svg>
    );
  }

  // 2. Databricks: Signature 4-layer stacked isometric diamond chevrons
  if (normKey === "databricks") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-label="Databricks"
      >
        {/* Top diamond */}
        <path
          d="M12 2.5L20 7L12 11.5L4 7L12 2.5Z"
          fill="#FF3621"
        />
        {/* Middle tier 1 */}
        <path
          d="M4.5 9.8L12 14L19.5 9.8L20 11.2L12 15.8L4 11.2L4.5 9.8Z"
          fill="#FF5F49"
        />
        {/* Middle tier 2 */}
        <path
          d="M4.5 14L12 18.2L19.5 14L20 15.4L12 20L4 15.4L4.5 14Z"
          fill="#E0220E"
        />
        {/* Bottom base shadow */}
        <path
          d="M6 17.8L12 21.2L18 17.8L18.8 19L12 22.8L5.2 19L6 17.8Z"
          fill="#A81504"
        />
      </svg>
    );
  }

  // 3. Microsoft Fabric: Signature faceted crystal ribbon
  if (normKey === "fabric") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-label="Microsoft Fabric"
      >
        <defs>
          <linearGradient id="fabCyan" x1="4" y1="4" x2="12" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00D2FF" />
            <stop offset="1" stopColor="#0078D4" />
          </linearGradient>
          <linearGradient id="fabViolet" x1="12" y1="4" x2="20" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A855F7" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="fabGreen" x1="4" y1="12" x2="12" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10B981" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="fabAmber" x1="12" y1="12" x2="20" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {/* Top-Left facet (Cyan) */}
        <path d="M12 3L4 9L9.5 13L12 10.5L12 3Z" fill="url(#fabCyan)" />
        {/* Top-Right facet (Violet) */}
        <path d="M12 3L20 9L14.5 13L12 10.5L12 3Z" fill="url(#fabViolet)" />
        {/* Bottom-Left facet (Green) */}
        <path d="M4 9L12 17L12 21L4 13V9Z" fill="url(#fabGreen)" />
        {/* Bottom-Right facet (Amber/Teal) */}
        <path d="M20 9L12 17L12 21L20 13V9Z" fill="url(#fabAmber)" />
      </svg>
    );
  }

  // 4. Apache Airflow: Signature aerodynamic pinwheel / swirl
  if (normKey === "airflow") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-label="Apache Airflow"
      >
        <defs>
          <linearGradient id="airflowGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00C7D4" />
            <stop offset="1" stopColor="#0284C7" />
          </linearGradient>
        </defs>
        {/* Dynamic swirl blades */}
        <path
          d="M12 12C12 7.5 15.5 4 20 4C20 8.5 16.5 12 12 12Z"
          fill="url(#airflowGrad)"
        />
        <path
          d="M12 12C16.5 12 20 15.5 20 20C15.5 20 12 16.5 12 12Z"
          fill="#0284C7"
        />
        <path
          d="M12 12C12 16.5 8.5 20 4 20C4 15.5 7.5 12 12 12Z"
          fill="url(#airflowGrad)"
          opacity="0.9"
        />
        <path
          d="M12 12C7.5 12 4 8.5 4 4C8.5 4 12 7.5 12 12Z"
          fill="#38BDF8"
        />
        {/* Central hub */}
        <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" />
      </svg>
    );
  }

  // 5. dbt: Signature isometric orange transformation cube
  if (normKey === "dbt") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-label="dbt"
      >
        {/* Top diamond */}
        <path d="M12 3L19 7L12 11L5 7L12 3Z" fill="#FF8369" />
        {/* Left side */}
        <path d="M5 7L12 11V19L5 15V7Z" fill="#FF522C" />
        {/* Right side */}
        <path d="M19 7L12 11V19L19 15V7Z" fill="#E03813" />
        {/* Inner transformation loop arrow */}
        <path
          d="M10 9.5L14 12V15L10 12.5V9.5Z"
          fill="#FFFFFF"
          fillOpacity="0.9"
        />
      </svg>
    );
  }

  // 6. Azure Data Factory: Cloud + pipeline gears & pipes
  if (normKey === "adf") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-label="Azure Data Factory"
      >
        <defs>
          <linearGradient id="adfGrad" x1="3" y1="5" x2="21" y2="19" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4" />
            <stop offset="1" stopColor="#005A9E" />
          </linearGradient>
        </defs>
        {/* Cloud body */}
        <path
          d="M7 16H18C19.7 16 21 14.7 21 13C21 11.5 19.9 10.2 18.5 10.05C18.2 6.8 15.4 4.5 12.2 4.8C9.7 5.0 7.7 6.9 7.3 9.4C5.4 9.6 4 11.2 4 13C4 14.7 5.3 16 7 16Z"
          fill="url(#adfGrad)"
        />
        {/* Pipeline connectors & gear */}
        <path
          d="M9 16V19C9 19.6 9.4 20 10 20H14C14.6 20 15 19.6 15 19V16"
          stroke="#50E6FF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="11" r="2.2" fill="#50E6FF" />
        <path
          d="M12 7.5V8.5M12 13.5V14.5M8.5 11H9.5M14.5 11H15.5"
          stroke="#50E6FF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 7. Data Lake & Medallion: 3 tiered cylinders (Bronze, Silver, Gold) with Delta ACID
  if (normKey === "datalake") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-label="Data Lake & Medallion"
      >
        {/* Bottom Tier: Bronze */}
        <path
          d="M5 16C5 14.9 8.1 14 12 14C15.9 14 19 14.9 19 16V19C19 20.1 15.9 21 12 21C8.1 21 5 20.1 5 19V16Z"
          fill="#CD7F32"
          fillOpacity="0.85"
        />
        {/* Middle Tier: Silver */}
        <path
          d="M6 10.5C6 9.5 8.7 8.8 12 8.8C15.3 8.8 18 9.5 18 10.5V13.5C18 14.5 15.3 15.2 12 15.2C8.7 15.2 6 14.5 6 13.5V10.5Z"
          fill="#94A3B8"
        />
        {/* Top Tier: Gold */}
        <ellipse cx="12" cy="6" rx="5.5" ry="2.5" fill="#F59E0B" />
        <path
          d="M6.5 6V8C6.5 9.4 9 10.5 12 10.5C15 10.5 17.5 9.4 17.5 8V6C17.5 7.4 15 8.5 12 8.5C9 8.5 6.5 7.4 6.5 6Z"
          fill="#D97706"
        />
        {/* Delta icon on Gold tier */}
        <path d="M12 4L14 7.2H10L12 4Z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 8. Enterprise Data Modeling: Kimball Star Schema dimensional topology
  if (normKey === "modeling") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-label="Enterprise Data Modeling"
      >
        {/* Connector lines to central Fact table */}
        <line x1="12" y1="12" x2="12" y2="4.5" stroke="#10B981" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
        <line x1="12" y1="12" x2="19.5" y2="12" stroke="#10B981" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
        <line x1="12" y1="12" x2="12" y2="19.5" stroke="#10B981" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
        <line x1="12" y1="12" x2="4.5" y2="12" stroke="#10B981" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
        <line x1="12" y1="12" x2="17.5" y2="6.5" stroke="#10B981" strokeWidth="1.2" strokeDasharray="1.5 1.5" />

        {/* Central Fact Table (Diamond/Star) */}
        <path d="M12 8.5L15.5 12L12 15.5L8.5 12L12 8.5Z" fill="#10B981" />
        <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" />

        {/* Dimension Satellite Nodes */}
        <circle cx="12" cy="4" r="2.2" fill="#3B82F6" stroke="#1E40AF" strokeWidth="0.8" />
        <circle cx="20" cy="12" r="2.2" fill="#3B82F6" stroke="#1E40AF" strokeWidth="0.8" />
        <circle cx="12" cy="20" r="2.2" fill="#3B82F6" stroke="#1E40AF" strokeWidth="0.8" />
        <circle cx="4" cy="12" r="2.2" fill="#3B82F6" stroke="#1E40AF" strokeWidth="0.8" />
        <circle cx="18" cy="6" r="1.8" fill="#8B5CF6" />
      </svg>
    );
  }

  // 9. SQL Server & Distributed SQL: Database stack + query lightning
  if (normKey === "sql") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-label="SQL Server & Distributed SQL"
      >
        {/* Top cylinder */}
        <ellipse cx="12" cy="6" rx="7" ry="2.8" fill="#0078D4" />
        <path
          d="M5 6V10C5 11.5 8.1 12.8 12 12.8C15.9 12.8 19 11.5 19 10V6C19 7.5 15.9 8.8 12 8.8C8.1 8.8 5 7.5 5 6Z"
          fill="#005A9E"
        />
        {/* Middle cylinder */}
        <path
          d="M5 11V15C5 16.5 8.1 17.8 12 17.8C15.9 17.8 19 16.5 19 15V11C19 12.5 15.9 13.8 12 13.8C8.1 13.8 5 12.5 5 11Z"
          fill="#004578"
        />
        {/* Bottom cylinder */}
        <path
          d="M5 16V19C5 20.5 8.1 21.8 12 21.8C15.9 21.8 19 20.5 19 19V16C19 17.5 15.9 18.8 12 18.8C8.1 18.8 5 17.5 5 16Z"
          fill="#002D50"
        />
        {/* T-SQL Query Lightning Strike */}
        <path
          d="M14 8L10 14H13L11 19L16 12H13L14 8Z"
          fill="#FACC15"
          stroke="#B45309"
          strokeWidth="0.8"
        />
      </svg>
    );
  }

  // 10. Real-Time Streaming & Kafka: Kafka distributed cluster node & pulse
  if (normKey === "streaming") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-label="Real-Time Streaming & Kafka"
      >
        {/* Central Kafka broker hub */}
        <circle cx="12" cy="12" r="3.2" fill="#E11D48" />
        <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" />

        {/* Orbiting stream nodes & links */}
        <path
          d="M12 4.5V8.5M12 15.5V19.5M4.5 12H8.5M15.5 12H19.5"
          stroke="#F43F5E"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="12" cy="3.5" r="2" fill="#FB7185" />
        <circle cx="12" cy="20.5" r="2" fill="#FB7185" />
        <circle cx="3.5" cy="12" r="2" fill="#FB7185" />
        <circle cx="20.5" cy="12" r="2" fill="#FB7185" />

        {/* Diagonal streaming pulse arcs */}
        <path
          d="M6.5 6.5C9.5 3.5 14.5 3.5 17.5 6.5"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 2"
        />
        <path
          d="M17.5 17.5C14.5 20.5 9.5 20.5 6.5 17.5"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 2"
        />
      </svg>
    );
  }

  // 11. Governance, Security & Quality: Purview/Unity shield + lock + verified seal
  if (normKey === "governance") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-label="Governance & Security"
      >
        <defs>
          <linearGradient id="govShield" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#4338CA" />
          </linearGradient>
        </defs>
        {/* Shield contour */}
        <path
          d="M12 2.5L4 6V11.5C4 16.5 7.5 20.8 12 22C16.5 20.8 20 16.5 20 11.5V6L12 2.5Z"
          fill="url(#govShield)"
        />
        {/* Inner verified keyhole / check lock */}
        <circle cx="12" cy="10" r="2.2" fill="#FFFFFF" />
        <path
          d="M10.8 11.5H13.2L13.8 15.5H10.2L10.8 11.5Z"
          fill="#FFFFFF"
        />
        <circle cx="16" cy="16.5" r="3" fill="#10B981" />
        <path
          d="M14.8 16.5L15.6 17.3L17.2 15.7"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // 12. Power BI & Semantic Layer: Stepped vertical ascending gold bars
  if (normKey === "powerbi") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-label="Power BI"
      >
        {/* Bar 1 (Left, Shortest) */}
        <rect x="4" y="13" width="4" height="8" rx="1.5" fill="#FACC15" />
        {/* Bar 2 (Center, Medium) */}
        <rect x="10" y="8" width="4" height="13" rx="1.5" fill="#EAB308" />
        {/* Bar 3 (Right, Tallest) */}
        <rect x="16" y="3" width="4" height="18" rx="1.5" fill="#CA8A04" />
        {/* VertiPaq memory link highlight */}
        <path
          d="M6 13L12 8L18 3"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="1.5 1.5"
          opacity="0.85"
        />
      </svg>
    );
  }

  // 13. Python for Data Engineering: Official dual blue/yellow interlocking snakes
  if (normKey === "python") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-label="Python for Data Engineering"
      >
        <defs>
          <linearGradient id="pyBlue" x1="4" y1="2" x2="15" y2="13" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="pyYellow" x1="9" y1="11" x2="20" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="1" stopColor="#EAB308" />
          </linearGradient>
        </defs>
        {/* Top-left Blue snake */}
        <path
          d="M11.8 2C8.3 2 8.5 3.5 8.5 3.5V5.5H12V6.5H5.8C5.8 6.5 2.5 6.2 2.5 10.2C2.5 14.2 5.2 14 5.2 14H6.8V11.8C6.8 9.5 8.8 9.5 8.8 9.5H12.2C14.3 9.5 14.3 7.6 14.3 7.6V4.1C14.3 4.1 14.6 2 11.8 2Z"
          fill="url(#pyBlue)"
        />
        <circle cx="10" cy="4" r="0.9" fill="#FFFFFF" />

        {/* Bottom-right Yellow snake */}
        <path
          d="M12.2 22C15.7 22 15.5 20.5 15.5 20.5V18.5H12V17.5H18.2C18.2 17.5 21.5 17.8 21.5 13.8C21.5 9.8 18.8 10 18.8 10H17.2V12.2C17.2 14.5 15.2 14.5 15.2 14.5H11.8C9.7 14.5 9.7 16.4 9.7 16.4V19.9C9.7 19.9 9.4 22 12.2 22Z"
          fill="url(#pyYellow)"
        />
        <circle cx="14" cy="20" r="0.9" fill="#0F172A" />
      </svg>
    );
  }

  // Fallback generic tech icon
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "rounded flex items-center justify-center bg-purple-500/10 text-purple-400 font-mono text-[10px] font-bold border border-purple-500/20 shrink-0",
        className
      )}
    >
      {normKey.slice(0, 2).toUpperCase()}
    </div>
  );
}
