"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

const Landing = () => {
  return (
    <div className="">
      {/* HERO SECTION */}
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl md:text-7xl font-bold text-black leading-tight">
          Gamify your growth
          <br />
          with <span className="text-[#ceab0d]">LevelUp</span>
        </h1>

        <p className="mt-6 text-lg text-gray-800 max-w-2xl">
          Empower your growth with a platform designed for modern learners.
        </p>

        <div className="flex gap-4 mt-10">
          <Link
            href="/home"
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-900 transition"
          >
            Get Started
          </Link>

          <button className="border border-black text-black px-6 py-3 rounded-md hover:bg-black hover:text-white transition">
            Learn More
          </button>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="py-20 px-6">
        <h2 className="text-4xl font-bold text-center text-black mb-14">
          Key Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="group border border-black rounded-xl p-8 bg-white hover:bg-gray-800 transition">
            <h3 className="text-xl font-semibold mb-3 text-black group-hover:text-white">
              Gamified Learning Levels
            </h3>
            <p className="text-gray-700 group-hover:text-white transition">
              Progress through structured levels from fundamentals to advanced
              development while earning XP, achievements, and milestones.
            </p>
          </div>

          <div className="group border border-black rounded-xl p-8 bg-white hover:bg-gray-800 transition">
            <h3 className="text-xl font-semibold mb-3 text-black group-hover:text-white">
              Structured Roadmaps
            </h3>
            <p className="text-gray-700 group-hover:text-white transition">
              Follow step-by-step learning paths covering DSA, projects, system
              design, and interview preparation to stay on track.
            </p>
          </div>

          <div className="group border border-black rounded-xl p-8 bg-white hover:bg-gray-800 transition">
            <h3 className="text-xl font-semibold mb-3 text-black group-hover:text-white">
              Community & Peer Progress
            </h3>
            <p className="text-gray-700 group-hover:text-white transition">
              See other learners at your level, stay motivated through healthy
              competition, and grow together as a community.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ SECTION */}
      <section className="py-24 px-6">
        {/* Heading */}
        <h2 className="text-4xl font-bold text-center mb-16">
          Frequently Asked Questions
        </h2>

        {/* Wider container */}
        <div className="max-w-5xl mx-auto">
          <Accordion type="single" collapsible className="space-y-6">
            <AccordionItem
              value="item-1"
              className="border border-black rounded-lg px-6"
            >
              <AccordionTrigger className="text-lg font-semibold">
                What is LevelUp?
              </AccordionTrigger>

              <AccordionContent className="text-gray-700 text-base pb-4">
                LevelUp is a gamified learning platform that helps students
                progress through structured learning levels while building
                real-world development skills and preparing for placements.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-2"
              className="border border-black rounded-lg px-6"
            >
              <AccordionTrigger className="text-lg font-semibold">
                How does the gamified learning system work?
              </AccordionTrigger>

              <AccordionContent className="text-gray-700 text-base pb-4">
                Users complete tasks, solve coding challenges, and build
                projects to earn XP points and unlock new levels. This keeps
                learning engaging and structured.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-3"
              className="border border-black rounded-lg px-6"
            >
              <AccordionTrigger className="text-lg font-semibold">
                Can I track my progress?
              </AccordionTrigger>

              <AccordionContent className="text-gray-700 text-base pb-4">
                Yes. LevelUp provides a dashboard where you can track completed
                tasks, XP points, learning streaks, and your overall progress.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-4"
              className="border border-black rounded-lg px-6"
            >
              <AccordionTrigger className="text-lg font-semibold">
                Is LevelUp suitable for beginners?
              </AccordionTrigger>

              <AccordionContent className="text-gray-700 text-base pb-4">
                Absolutely. The platform starts from fundamentals and gradually
                guides learners toward advanced development and interview
                preparation.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA (Call To Action) */}
      <div className="py-28 px-6 flex flex-col items-center justify-center text-center">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold text-[#ceab0d]">
          Ready to Level Up Your Learning?
        </h2>

        {/* Subtitle */}
        <p className="mt-6 text-lg text-gray-800 max-w-2xl">
          Join students who are transforming their learning journey through
          gamified levels, structured roadmaps, and real project experience.
        </p>

        {/* Animated Button */}
        <div className="flex ">
          <button className="mt-10  flex items-center gap-2 bg-black text-white px-8 py-2 rounded-md">
            Start Your Journey
            <span className="">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
