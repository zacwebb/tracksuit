import { useState } from "react";
import { BRANDS } from "../../lib/consts.ts";
import { Button } from "../button/button.tsx";
import { Modal, type ModalProps } from "../modal/modal.tsx";
import styles from "./add-insight.module.css";

type AddInsightProps = ModalProps & {
  onInsightAdded?: () => void;
};

export const AddInsight = ({ onInsightAdded, ...props }: AddInsightProps) => {
  const [brand, setBrand] = useState<number>(BRANDS[0].id);
  const [text, setText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addInsight = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      setError("Please enter an insight");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/insights/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand,
          text: text.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create insight");
      }

      // Reset form
      setBrand(BRANDS[0].id);
      setText("");

      // Close modal
      props.onClose?.();

      // Notify parent component
      onInsightAdded?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal {...props}>
      <h1 className={styles.heading}>Add a new insight</h1>
      <form className={styles.form} onSubmit={addInsight}>
        <label className={styles.field}>
          Brand
          <select
            className={styles["field-input"]}
            value={brand}
            onChange={(e) => setBrand(Number(e.target.value))}
            disabled={isLoading}
          >
            {BRANDS.map(({ id, name }) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Insight
          <textarea
            className={styles["field-input"]}
            rows={5}
            placeholder="Something insightful..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
        </label>
        {error && (
          <div
            className={styles.error}
            style={{ color: "red", marginBottom: "1rem" }}
          >
            {error}
          </div>
        )}
        <Button
          className={styles.submit}
          type="submit"
          label={isLoading ? "Adding..." : "Add insight"}
          disabled={isLoading}
        />
      </form>
    </Modal>
  );
};
