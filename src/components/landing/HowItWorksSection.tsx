import { motion } from "framer-motion";
import { Upload, Cpu, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Claim",
    description: "Drop images, documents, or PDFs into our secure upload portal.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Analysis",
    description: "Our AI engines process damage detection, OCR, and fraud checks simultaneously.",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Get Results",
    description: "Receive a comprehensive report with damage assessment, cost estimate, and risk score.",
  },
];

const HowItWorksSection = () => {
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
            Three Steps to <span className="gradient-text">Automation</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From upload to decision in under 30 seconds.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((s, index) => (
            <motion.div
              key={s.step}
              className="relative text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="text-6xl font-bold font-display gradient-text opacity-20 mb-4">{s.step}</div>
              <div className="w-16 h-16 rounded-2xl glass mx-auto flex items-center justify-center mb-4">
                <s.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold font-display mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              {index < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-primary/40 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
