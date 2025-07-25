import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  const feedback = interview ? await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  }) : null;

  if (!interview || !feedback) {
    return (
      <section className="section-feedback flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-semibold mb-4 text-red-400">Feedback Not Found</h1>
        <p className="mb-6 text-lg text-center text-light-100 max-w-xl">
          Sorry, we couldn't find feedback for this interview. It may not have been generated yet, or there was an error. Please try again later or contact support if the problem persists.
        </p>
        <Button className="btn-primary">
          <Link href="/">Return to Dashboard</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold">
          Feedback on the Interview -{" "}
          <span className="capitalize">{interview.role}</span> Interview
        </h1>
      </div>

      <div className="flex flex-row justify-center ">
        <div className="flex flex-row gap-5">
          {/* Overall Impression */}
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={22} height={22} alt="star" />
            <p>
              Overall Impression:{" "}
              <span className="text-primary-200 font-bold">
                {feedback?.totalScore}
              </span>
              /100
            </p>
          </div>

          {/* Date */}
          <div className="flex flex-row gap-2">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p>
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <hr />

      {/* Structured Feedback Sections */}
      <div className="w-full max-w-2xl mx-auto overflow-y-auto max-h-[60vh] animate-fade-in bg-zinc-900 rounded-xl p-6 mt-6 mb-8 border border-zinc-700 shadow-sm">
        {(() => {
          const text = (feedback?.finalAssessment || '').replace(/---+/g, '').trim();
          const sectionRegex = /(Communication Skills:|Technical Knowledge:|Problem-Solving Ability:|Cultural & Role Fit:|Confidence & Clarity:|Final Assessment:)([\s\S]*?)(?=Communication Skills:|Technical Knowledge:|Problem-Solving Ability:|Cultural & Role Fit:|Confidence & Clarity:|Final Assessment:|$)/g;
          const sections = [];
          let match;
          while ((match = sectionRegex.exec(text)) !== null) {
            const header = match[1].replace(":", "").trim();
            const content = match[2].trim();
            sections.push({ header, content });
          }
          return sections.map((section, idx) => (
            <section key={idx} className="mb-6">
              <h3 className="block font-bold text-primary-200 mb-1 text-lg">
                {section.header}
              </h3>
              <p className="text-light-100 whitespace-pre-line leading-relaxed">
                {section.content}
              </p>
              {idx < sections.length - 1 && (
                <hr className="my-6 border-zinc-700" />
              )}
            </section>
          ));
        })()}
      </div>

      {/* Interview Breakdown */}
      <div className="flex flex-col gap-4">
        <h2>Breakdown of the Interview:</h2>
        {feedback?.categoryScores?.map((category, index) => (
          <div key={index}>
            <p className="font-bold">
              {index + 1}. {category.name} ({category.score}/100)
            </p>
            <p>{category.comment}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3>Strengths</h3>
        <ul>
          {feedback?.strengths?.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3>Areas for Improvement</h3>
        <ul>
          {feedback?.areasForImprovement?.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>

      <div className="buttons">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              Back to dashboard
            </p>
          </Link>
        </Button>

        <Button className="btn-primary flex-1">
          <Link
            href={`/interview/${id}`}
            className="flex w-full justify-center"
          >
            <p className="text-sm font-semibold text-black text-center">
              Retake Interview
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;
