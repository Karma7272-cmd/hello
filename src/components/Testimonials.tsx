import React from 'react';

const testimonials = [
  {
    content: "Nexus completely transformed how our team operates. We shipped our last major feature 3 weeks ahead of schedule.",
    author: "Sarah Jenkins",
    role: "CTO at TechFlow",
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    content: "The automation capabilities are unmatched. What used to take our ops team days now happens in seconds.",
    author: "Marcus Chen",
    role: "Head of Ops at ScaleUp",
    avatar: "https://i.pravatar.cc/150?u=marcus"
  },
  {
    content: "Best developer experience I've seen in a SaaS product. The API is beautifully documented and a joy to use.",
    author: "Elena Rodriguez",
    role: "Lead Engineer at BuildCo",
    avatar: "https://i.pravatar.cc/150?u=elena"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Loved by innovative teams
          </h2>
          <p className="text-lg text-slate-600">
            Don't just take our word for it. See what our customers are saying.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <p className="text-slate-700 text-lg leading-relaxed mb-8">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4">
                <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-bold text-slate-900">{testimonial.author}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
