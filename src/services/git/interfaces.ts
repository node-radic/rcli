export interface GitUser {}
export interface GitGroup {}
export interface GitRepository { }
export interface IGitTransformer {
    createRepository(res)
    listRepositories(res)
    getUserGroups(res)
    deleteRepository(res)
}