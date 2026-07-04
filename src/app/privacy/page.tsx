import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Proform',
  description: 'Privacy Policy for Proform',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/auth/signup"
          className="text-sm font-semibold text-[#8B5CF6] hover:text-[#6202AC]"
        >
          ← Back
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-black mt-6 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: [Month Day, Year]</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <p>
            [Company Legal Name] (&ldquo;<strong>Proform</strong>&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
            &ldquo;our&rdquo;) respects your privacy and is committed to protecting the personal
            information you share with us. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you use the Proform mobile application
            and website (together, the &ldquo;Service&rdquo;).
          </p>
          <p>
            By creating an account or otherwise using the Service, you agree to the collection and
            use of information in accordance with this policy. If you do not agree, please do not
            use the Service.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect the following categories of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account information:</strong> name, email address, password, and profile
                details you provide when you register.
              </li>
              <li>
                <strong>Health and fitness data:</strong> workouts, exercise logs, sets and reps,
                cardio sessions, body metrics (e.g. weight, measurements), macro and micro
                nutrition tracking, progress photos, and recovery data you choose to log.
              </li>
              <li>
                <strong>Coach and team data:</strong> if you use team, coaching, or accountability
                features, we collect information shared between coaches and players, including
                itineraries, checklists, points, and activity feeds.
              </li>
              <li>
                <strong>Payment information:</strong> if you purchase a subscription or program,
                billing details are processed by our third-party payment processor. We do not
                store full payment card numbers on our servers.
              </li>
              <li>
                <strong>Device and usage data:</strong> IP address, device identifiers, browser
                type, operating system, and log data collected automatically when you use the
                Service.
              </li>
              <li>
                <strong>Media:</strong> photos or videos you upload (e.g. progress photos,
                highlight uploads).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To create and manage your account and provide the Service.</li>
              <li>To track and display your fitness progress, programs, and recommendations.</li>
              <li>To enable communication between coaches, teams, and players.</li>
              <li>To process payments and manage subscriptions.</li>
              <li>To send you service-related notifications, reminders, and updates.</li>
              <li>To maintain the security, integrity, and performance of the Service.</li>
              <li>To comply with legal obligations and enforce our Terms and Conditions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">3. How We Share Your Information</h2>
            <p className="mb-3">
              We do not sell your personal information. We may share information with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Your coach or team:</strong> if you join a team or are assigned a coach,
                relevant fitness and progress data may be visible to them.
              </li>
              <li>
                <strong>Service providers:</strong> hosting, analytics, and payment processing
                vendors who process data on our behalf under confidentiality obligations.
              </li>
              <li>
                <strong>Legal and safety:</strong> when required by law, regulation, or legal
                process, or to protect the rights, property, or safety of Proform, our users, or
                the public.
              </li>
              <li>
                <strong>Business transfers:</strong> in connection with a merger, acquisition, or
                sale of assets, subject to this Privacy Policy.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">4. Data Storage and Security</h2>
            <p>
              We use commercially reasonable administrative, technical, and physical safeguards to
              protect your information. However, no method of transmission or storage is 100%
              secure, and we cannot guarantee absolute security. Your data may be stored and
              processed in [Country/Region], which may have different data protection laws than
              your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">5. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as
              needed to provide the Service, comply with legal obligations, resolve disputes, and
              enforce our agreements. You may request deletion of your account and associated data
              at any time, as described below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">6. Your Rights and Choices</h2>
            <p className="mb-3">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access, correct, or update your personal information.</li>
              <li>Request deletion of your account and personal data.</li>
              <li>Object to or restrict certain processing of your data.</li>
              <li>Request a copy of your data in a portable format.</li>
              <li>Withdraw consent where processing is based on consent.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{' '}
              <a
                href="mailto:privacy@proformapp.com"
                className="text-[#8B5CF6] hover:text-[#6202AC] font-medium"
              >
                privacy@proformapp.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">7. Children&apos;s Privacy</h2>
            <p>
              The Service is not directed to children under 13 (or the minimum age required in
              your jurisdiction). We do not knowingly collect personal information from children.
              If we learn we have collected such information, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">8. Third-Party Links and Services</h2>
            <p>
              The Service may contain links to third-party websites or integrate with third-party
              services (e.g. payment processors). We are not responsible for the privacy practices
              of those third parties, and we encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by posting the updated policy on this page and updating the &ldquo;Last
              updated&rdquo; date above. Continued use of the Service after changes take effect
              constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">10. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices,
              contact us at:
            </p>
            <p className="mt-2">
              [Company Legal Name]
              <br />
              [Company Address]
              <br />
              Email:{' '}
              <a
                href="mailto:privacy@proformapp.com"
                className="text-[#8B5CF6] hover:text-[#6202AC] font-medium"
              >
                privacy@proformapp.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100">
          <Link
            href="/terms"
            className="text-sm font-semibold text-[#8B5CF6] hover:text-[#6202AC]"
          >
            View our Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
