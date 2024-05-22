import { CheckIcon } from "@radix-ui/react-icons";

export default function Step({
  styleClass,
  number,
  check,
}: {
  styleClass: string;
  number: number;
  check?: boolean;
}) {
  return (
    <div className={styleClass}>
      {check ? <CheckIcon /> : number}
    </div>
  );
}
