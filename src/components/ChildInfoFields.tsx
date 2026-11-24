import type { Family } from "@/lib/types";
import { ageLabel } from "@/lib/stages";
import { field, label } from "./formStyles";

/** Name / age / gender inputs, prefilled from the saved profile. Field names match ChildInfoSchema. */
export function ChildInfoFields({ family }: { family: Family | null }) {
  return (
    <div className="grid gap-5 sm:grid-cols-3">
      <div>
        <label className={label} htmlFor="childName">名字（会写进故事里）</label>
        <input id="childName" name="childName" required maxLength={20} defaultValue={family?.childName} placeholder="小米" className={field} />
      </div>
      <div>
        <label className={label} htmlFor="childAge">年龄</label>
        <select id="childAge" name="childAge" defaultValue={family?.childAge ?? 3} className={field}>
          {Array.from({ length: 13 }, (_, i) => i).map((n) => (
            <option key={n} value={n}>
              {ageLabel(n)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={label} htmlFor="childGender">性别</label>
        <select id="childGender" name="childGender" defaultValue={family?.childGender ?? "unspecified"} className={field}>
          <option value="girl">女孩</option>
          <option value="boy">男孩</option>
          <option value="unspecified">不指定</option>
        </select>
      </div>
    </div>
  );
}
