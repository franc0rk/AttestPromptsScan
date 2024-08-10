export default function TagsSection() {
  return (
    <section className="flex p-4">
      <div className="mr-2 border rounded-full text-xs px-3 py-1 bg-white text-black">
        all
      </div>
      <div className="mr-2 border rounded-full text-xs px-3 py-1">
        #transactions
      </div>
      <div className="mr-2 border rounded-full text-xs px-3 py-1">#nfts</div>
      <div className="mr-2 border rounded-full text-xs px-3 py-1">#tokens</div>
      <div className="mr-2 border rounded-full text-xs px-3 py-1">more...</div>
    </section>
  );
}
