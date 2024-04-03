const helloEdge = (request, context) => {
  try {
    console.log(request);
    const url = new URL(request.url);
    const params = url.searchParams;
    const subject = params.get('name') || 'World';
    return new Response(JSON.stringify({ message: `Hello ${subject}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(error.toString(), { status: 500 });
  }
};
export default helloEdge;
