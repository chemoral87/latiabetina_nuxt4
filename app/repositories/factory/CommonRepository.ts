export default ($api) => (resource) => ({
  index(params) {
    return $api(resource, { params })
  },
  filter(params) {
    return $api(resource + "/filter", { params })
  },
  show(id) {
    return $api(resource + "/" + id)
  },
  create(data) {
    return $api(resource, { method: "POST", body: data })
  },
  update(id, data) {
    return $api(resource + "/" + id, { method: "PUT", body: data })
  },
  delete(id) {
    return $api(resource + "/" + id, { method: "DELETE" })
  },
})