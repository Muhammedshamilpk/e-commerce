
"use client";

import { useState } from "react";
import {
  Search,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Send,
  FileText,
  Headphones,
  CheckCircle,
  LifeBuoy,
} from "lucide-react";

const faqs = [
  {
    question: "How can I add a new product?",
    category: "Products",
    answer:
      "Navigate to the Products section from the sidebar. Click Add Product, enter the product name, description, price, stock quantity and upload a product image. Then click Save Product.",
  },
  {
    question: "How can I manage customer orders?",
    category: "Orders",
    answer:
      "Open the Orders section from the sidebar. You can view order details, search orders, filter by status and update order processing information.",
  },
  {
    question: "How can I update an order status?",
    category: "Orders",
    answer:
      "Open the required order and select the appropriate status, such as Processing, Shipped, Delivered or Cancelled. Save the changes to update the order.",
  },
  {
    question: "How can I manage customer accounts?",
    category: "Customers",
    answer:
      "Navigate to Customers. You can search customers, view their contact information, check purchase history and manage their account status.",
  },
  {
    question: "How do I respond to customer complaints?",
    category: "Tickets",
    answer:
      "Open Customer Tickets, select the ticket using the view icon, read the conversation and enter your response in the reply section. Click Send Reply.",
  },
  {
    question: "How can I change my admin password?",
    category: "Security",
    answer:
      "Navigate to Settings, open the Security section and enter your current password, new password and confirmation. Password changes require backend authentication.",
  },
  {
    question: "How can I update store information?",
    category: "Settings",
    answer:
      "Open Settings and select General. You can edit the store name, email address, contact number, address and website.",
  },
  {
    question: "How can I manage notifications?",
    category: "Settings",
    answer:
      "Open Settings and select Notifications. Use the switches to configure your preferred notification settings.",
  },
];

const categories = [
  "All",
  "Products",
  "Orders",
  "Customers",
  "Tickets",
  "Settings",
  "Security",
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || faq.category === category;

    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitted(true);

    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="space-y-7">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Help & Support
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Find answers, explore guides and contact our support team.
        </p>
      </div>

      {/* Welcome Banner */}
      <div className="bg-blue-600 rounded-2xl p-8 text-white">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <LifeBuoy size={30} />
            <span className="text-sm font-medium text-blue-100">
              ABC Admin Support
            </span>
          </div>

          <h2 className="text-2xl font-bold">
            How can we help you?
          </h2>

          <p className="text-sm text-blue-100 mt-2">
            Search our frequently asked questions or submit a
            support request to get assistance.
          </p>

          <div className="relative mt-6 max-w-xl">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpenFaq(null);
              }}
              placeholder="Search for help..."
              className="w-full bg-white text-slate-800 placeholder:text-slate-400 rounded-lg py-3 pl-11 pr-4 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Support Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <BookOpen size={23} />
          </div>

          <h3 className="font-semibold text-slate-800">
            Documentation
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Learn how to use the dashboard and manage your store.
          </p>

          <a
            href="#faq"
            className="inline-block text-sm text-blue-600 font-medium mt-4 hover:underline"
          >
            Explore FAQs →
          </a>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="w-11 h-11 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-4">
            <Mail size={23} />
          </div>

          <h3 className="font-semibold text-slate-800">
            Email Support
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Contact our support team for assistance.
          </p>

          <a
            href="mailto:support@abc.com"
            className="inline-block text-sm text-blue-600 font-medium mt-4 hover:underline"
          >
            Send an Email →
          </a>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <Headphones size={23} />
          </div>

          <h3 className="font-semibold text-slate-800">
            Support Request
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Submit your issue using our support form.
          </p>

          <a
            href="#contact"
            className="inline-block text-sm text-blue-600 font-medium mt-4 hover:underline"
          >
            Contact Support →
          </a>
        </div>

      </div>

      {/* FAQ Section */}
      <div
        id="faq"
        className="bg-white border border-slate-200 rounded-xl p-6"
      >

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <HelpCircle size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500">
              Find quick answers to common questions.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => {
                setCategory(item);
                setOpenFaq(null);
              }}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                category === item
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="divide-y divide-slate-100">

          {filteredFaqs.map((faq) => {
            const index = faqs.indexOf(faq);
            const isOpen = openFaq === index;

            return (
              <div key={faq.question} className="py-4">

                <button
                  onClick={() =>
                    setOpenFaq(isOpen ? null : index)
                  }
                  className="w-full flex items-center justify-between gap-4 text-left"
                >
                  <div>
                    <h3 className="text-sm font-medium text-slate-800">
                      {faq.question}
                    </h3>

                    <span className="text-xs text-blue-600 mt-1 inline-block">
                      {faq.category}
                    </span>
                  </div>

                  {isOpen ? (
                    <ChevronUp
                      size={19}
                      className="text-slate-400 shrink-0"
                    />
                  ) : (
                    <ChevronDown
                      size={19}
                      className="text-slate-400 shrink-0"
                    />
                  )}
                </button>

                {isOpen && (
                  <p className="text-sm text-slate-600 leading-6 mt-3 pr-8">
                    {faq.answer}
                  </p>
                )}

              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-10">
              <Search
                size={30}
                className="mx-auto text-slate-300 mb-3"
              />
              <p className="text-sm text-slate-600 font-medium">
                No matching questions found.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try another search term or category.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Contact Support Form */}
      <div
        id="contact"
        className="bg-white border border-slate-200 rounded-xl p-6"
      >

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
            <MessageCircle size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Contact Support
            </h2>
            <p className="text-sm text-slate-500">
              Submit your issue and our team can assist you.
            </p>
          </div>
        </div>

        {submitted ? (

          <div className="text-center py-10">
            <CheckCircle
              size={48}
              className="mx-auto text-green-500 mb-4"
            />

            <h3 className="text-lg font-semibold text-slate-800">
              Request Submitted!
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Your support request has been recorded in this demo.
            </p>

            <button
              onClick={() => setSubmitted(false)}
              className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Submit Another Request
            </button>
          </div>

        ) : (

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Name
                </label>

                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Enter your name"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>

                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="Enter your email"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Subject
              </label>

              <input
                required
                type="text"
                value={form.subject}
                onChange={(e) =>
                  setForm({ ...form, subject: e.target.value })
                }
                placeholder="Enter the issue subject"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Describe Your Issue
              </label>

              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) =>
                  setForm({ ...form, message: e.target.value })
                }
                placeholder="Explain your issue in detail..."
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                <Send size={17} />
                Submit Request
              </button>
            </div>

          </form>

        )}

      </div>

      {/* Footer Contact Information */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold text-slate-800">
          Need additional assistance?
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          Contact the ABC support team directly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">

          <a
            href="mailto:support@abc.com"
            className="flex items-center gap-2 text-sm text-blue-600"
          >
            <Mail size={17} />
            support@abc.com
          </a>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone size={17} />
            Contact number: Configure support number
          </div>

        </div>
      </div>

    </div>
  );
}
