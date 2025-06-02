import { useRouter } from "next/navigation";

const EmotionResult = () => {
  const router = useRouter();
  const { emotion } = router.query;

  if (!emotion) {
    return <div>No emotion data available.</div>;
  }

  return (
    <div>
      <h1>Emotion Detection Result</h1>
      <p>{emotion}</p>
    </div>
  );
};

export default EmotionResult;
