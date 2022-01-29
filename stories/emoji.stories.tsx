import React, { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RichTextarea } from "../src";
import emoji from "node-emoji";

export default {
  title: "examples",
};

const style = { width: "400px", height: "300px" };

const MAX_CHARS = 8;
const MENTION_REG = /:([\-+\w]*)$/;

export const Emoji = () => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(`Type : to show suggestions 💪\n\n`);
  const [pos, setPos] =
    useState<{ top: number; left: number; caretStart: number } | null>(null);
  const [index, setIndex] = useState<number>(0);

  const targetText = pos ? text.slice(0, pos.caretStart) : text;
  const match = pos && targetText.match(MENTION_REG);
  const name = match?.[1] ?? "";
  const chars = useMemo(() => emoji.search(name).slice(0, MAX_CHARS), [name]);
  const complete = () => {
    const selected = chars[index].emoji;
    setText(
      targetText.replace(MENTION_REG, "") +
        `${selected} ` +
        text.slice(pos.caretStart)
    );
    setPos(null);
    setIndex(null);
  };

  return (
    <div>
      <RichTextarea
        ref={ref}
        style={style}
        onChange={(e) => setText(e.target.value)}
        value={text}
        onKeyDown={(e) => {
          if (!pos || !chars.length) return;
          switch (e.code) {
            case "ArrowUp":
              e.preventDefault();
              const nextIndex = index <= 0 ? chars.length - 1 : index - 1;
              setIndex(nextIndex);
              break;
            case "ArrowDown":
              e.preventDefault();
              const prevIndex = index >= chars.length - 1 ? 0 : index + 1;
              setIndex(prevIndex);
              break;
            case "Enter":
              e.preventDefault();
              complete();
              break;
            case "Escape":
              e.preventDefault();
              setPos(null);
              setIndex(null);
              break;
            default:
              break;
          }
        }}
        onCaretPositionChange={(r) => {
          if (r && MENTION_REG.test(text.slice(0, r.caretStart))) {
            setPos({
              top: r.top + r.height,
              left: r.left,
              caretStart: r.caretStart,
            });
            setIndex(0);
          } else {
            setPos(null);
            setIndex(null);
          }
        }}
      />
      {pos &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: window.pageYOffset + pos.top,
              left: window.pageXOffset + pos.left,
              fontSize: "16px",
              border: "solid 1px gray",
              borderRadius: "3px",
              background: "white",
              cursor: "pointer",
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              complete();
            }}
          >
            {(() => {
              return chars.map((c, i) => (
                <div
                  key={c}
                  style={{
                    padding: "4px",
                    ...(index === i && {
                      color: "white",
                      background: "#2A6AD3",
                    }),
                  }}
                >
                  {`${c.emoji} ${c.key}`}
                </div>
              ));
            })()}
          </div>,
          document.body
        )}
    </div>
  );
};
