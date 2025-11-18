
//get a request
export function getRequests() {
  const stored = localStorage.getItem("requests");
  return stored ? JSON.parse(stored) : [];
}

// Add a request
export function addRequest(newRequest) {
  const requests = getRequests();
  requests.push(newRequest);
  localStorage.setItem("requests", JSON.stringify(requests));
}

// Update a request
export function updateRequest(updatedData) {
  const requests = getRequests();
  const index = requests.findIndex(request => request.requestId === updatedData.id);

  if (index !== -1) {
    requests[index] = { ...requests[index], ...updatedData };
    localStorage.setItem("requests", JSON.stringify(requests));
  }
}

// Delete a request
export function deleteRequest(id) {
  const requests = getRequests().filter(r => r.requestId !== id);
  localStorage.setItem("requests", JSON.stringify(requests));
}
