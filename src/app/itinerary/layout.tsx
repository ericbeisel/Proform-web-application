import TabsShell from "@/components/itinerary/Tabsshell";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TabsShell>{children}</TabsShell>;
}