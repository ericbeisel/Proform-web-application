import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Proform',
  description: 'Terms and Conditions for Proform',
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: [Month Day, Year]</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <p>
            These Terms of Service (&ldquo;<strong>Terms</strong>&rdquo;) govern your access to and
            use of the Proform mobile application and website (together, the &ldquo;Service&rdquo;),
            operated by [Company Legal Name] (&ldquo;<strong>Proform</strong>&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By creating an account or otherwise using the
            Service, you agree to be bound by these Terms and our{' '}
            <Link href="/privacy" className="text-[#8B5CF6] hover:text-[#6202AC] font-medium">
              Privacy Policy
            </Link>
            . If you do not agree, do not use the Service.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">1. Eligibility</h2>
            <p>
              You must be at least 13 years old (or the minimum age of digital consent in your
              jurisdiction) to use the Service. By using the Service, you represent that you meet
              this requirement and, if you are a minor, that a parent or legal guardian has
              reviewed and agreed to these Terms on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">2. Your Account</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must provide accurate and complete information when creating your account.</li>
              <li>Notify us immediately at [support email] if you suspect unauthorized use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">3. Health and Fitness Disclaimer</h2>
            <p>
              Proform provides workout tracking, nutrition logging, coaching, and related fitness
              tools for informational and organizational purposes only. The Service does{' '}
              <strong>not</strong> provide medical advice, diagnosis, or treatment. Always consult a
              qualified physician before beginning any exercise, nutrition, or training program,
              particularly if you have a pre-existing medical condition. You assume all risks
              associated with physical activity undertaken based on information in the Service, and
              Proform is not liable for any injury, illness, or health issue arising from your use
              of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">4. Coaches, Teams, and User Content</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                If you join a team or work with a coach through the Service, you consent to
                sharing relevant workout, progress, and activity data with that coach or team
                admin.
              </li>
              <li>
                You retain ownership of content you upload (e.g. progress photos, highlight
                videos), but grant Proform a non-exclusive, worldwide, royalty-free license to
                host, store, and display that content solely to operate and provide the Service.
              </li>
              <li>
                You agree not to upload content that is unlawful, infringing, abusive, or violates
                the rights of any third party.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">5. Subscriptions and Payments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Certain features, programs, or packages may require payment of fees or a recurring
                subscription, as described at the time of purchase.
              </li>
              <li>
                Subscriptions automatically renew unless cancelled before the renewal date, in
                accordance with the terms presented at checkout.
              </li>
              <li>
                Fees are non-refundable except as required by law or as expressly stated at the
                time of purchase.
              </li>
              <li>
                We reserve the right to change our pricing with reasonable advance notice.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">6. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any unlawful purpose or in violation of these Terms.</li>
              <li>Attempt to gain unauthorized access to the Service, other accounts, or our systems.</li>
              <li>Reverse engineer, decompile, or attempt to extract the source code of the Service.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">7. Intellectual Property</h2>
            <p>
              The Service, including its design, features, graphics, and underlying software, is
              owned by [Company Legal Name] and protected by intellectual property laws. Except for
              the limited license to use the Service as intended, no rights are granted to you in
              our intellectual property.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">8. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any time, with or without
              notice, if you violate these Terms or for any other reason at our discretion. You may
              stop using the Service or delete your account at any time by contacting us at
              [support email].
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">9. Disclaimers</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
              warranties of any kind, whether express or implied, including but not limited to
              warranties of merchantability, fitness for a particular purpose, and
              non-infringement. We do not guarantee that the Service will be uninterrupted, secure,
              or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, [Company Legal Name] shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages, or any loss of
              profits or data, arising from your use of or inability to use the Service, even if we
              have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of
              [Country/State], without regard to its conflict of law principles. Any disputes
              arising under these Terms shall be subject to the exclusive jurisdiction of the
              courts located in [Jurisdiction].
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">12. Changes to These Terms</h2>
            <p>
              We may modify these Terms from time to time. We will notify you of material changes
              by posting the updated Terms on this page and updating the &ldquo;Last updated&rdquo;
              date above. Continued use of the Service after changes take effect constitutes
              acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">13. Contact Us</h2>
            <p>
              If you have any questions about these Terms, contact us at:
            </p>
            <p className="mt-2">
              [Company Legal Name]
              <br />
              [Company Address]
              <br />
              Email:{' '}
              <a
                href="mailto:support@proformapp.com"
                className="text-[#8B5CF6] hover:text-[#6202AC] font-medium"
              >
                support@proformapp.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100">
          <Link
            href="/privacy"
            className="text-sm font-semibold text-[#8B5CF6] hover:text-[#6202AC]"
          >
            View our Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
