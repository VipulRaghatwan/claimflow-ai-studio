import { motion } from "framer-motion";
import { ScanSearch, FileText, ShieldAlert, Calculator } from "lucide-react";

const features = [
  {
    icon: ScanSearch,
    title: "Damage Detection",
    description: "AI vision analyzes uploaded photos to identify and classify damage types with 98% accuracy.",
    gradient: "from-primary to-cyan",
  },
  {
    icon: FileText,
    title: "OCR Processing",
    description: "Extract data from documents, receipts, and forms instantly with intelligent text recognition.",
    gradient: "from-cyan to-success",
  },
  {
    icon: ShieldAlert,
    title: "Fraud Detection",
    description: "Machine learning models flag suspicious patterns and anomalies in real-time.",
    gradient: "from-accent to-pink-500",
  },
  {
    icon: Calculator,
    title: "Cost Estimation",
    description: "Automated repair cost calculations based on damage assessment and market data.",
    gradient: "from-warning to-accent",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
            Powered by <span className="gradient-text">Intelligence</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Four AI engines working together to transform your claims workflow.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="glass hover-lift p-6 group cursor-default"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold font-display mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
