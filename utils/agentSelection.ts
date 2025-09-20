import { AgentProfile, MRV_AGENTS } from '../constants';
import { AgentCapability } from '../types';

/**
 * @en Selects the most suitable agent for a specific task deterministically.
 *     This replaces the AI-based orchestrator model to reduce latency and costs.
 * @de Wählt den am besten geeigneten Agenten für eine bestimmte Aufgabe deterministisch aus.
 *     Dies ersetzt das KI-basierte Orchestrator-Modell, um Latenz und Kosten zu reduzieren.
 * @param capability - The capability to be executed (e.g., 'workload_calculation').
 * @returns The selected agent profile.
 * @returns Ein Profil des ausgewählten Agenten.
 */
export const selectAgentForTask = (capability: AgentCapability): AgentProfile => {
    switch (capability) {
        // Analysis & Research
        // Analyse & Recherche
        case 'workload_calculation':
        case 'cost_analysis':
            return MRV_AGENTS.workloadAnalyst;
        case 'document_analysis':
        case 'information_extraction':
        case 'document_linking':
        case 'un_submission_assistance':
            return MRV_AGENTS.documentAnalyst;
        case 'legal_analysis':
        case 'contradiction_detection':
        case 'compliance_check':
            return MRV_AGENTS.legalExpert;
        case 'risk_assessment':
            return MRV_AGENTS.riskAnalyst;
        case 'case_analysis': // For insights and reports / Für Einblicke und Berichte
        case 'report_generation':
        case 'research':
            return MRV_AGENTS.researchSpecialist;
        case 'attrition_analysis': // Ethics analysis / Ethik-Analyse
            return MRV_AGENTS.ethicsAdvisor;

        // Creation & Strategy
        // Erstellung & Strategie
        case 'content_creation':
        case 'official_documents':
        case 'un_submission_finalization':
            return MRV_AGENTS.contentCreator;
        case 'strategy_development':
            return MRV_AGENTS.strategyConsultant;
        case 'kpi_suggestion':
            return MRV_AGENTS.researchSpecialist;
        
        // Process & Optimization
        // Prozess & Optimierung
        case 'task_suggestion':
            return MRV_AGENTS.processOptimizer;

        // Communication
        // Kommunikation
        case 'public_communication':
            return MRV_AGENTS.communicationExpert;

        default:
            // Fallback to a capable all-rounder
            // Fallback auf einen fähigen Allrounder
            console.warn(`No specific agent found for capability '${capability}'. Falling back to DocumentAnalyst.`);
            console.warn(`Kein spezifischer Agent für Fähigkeit '${capability}' gefunden. Fallback auf DocumentAnalyst.`);
            return MRV_AGENTS.documentAnalyst;
    }
};