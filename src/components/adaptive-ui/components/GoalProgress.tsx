import { goalSchema, type Props } from "../schemas";
import { GoalCard } from "../../../features/goals/GoalCard";
import { Invalid } from "../Invalid";
export function Progress({ component }: Props) {
  const result = goalSchema.safeParse(component.props);
  return result.success ? <GoalCard goal={result.data} /> : <Invalid />;
}
