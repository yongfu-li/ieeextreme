#include <algorithm>
#include <deque>
#include <iostream>
#include <numeric>
#include <utility>
#include <vector>

using namespace std;

static bool solvable(const int n, const vector<pair<int, int>>& edges, const int lim) {
    const int full = (1 << n) - 1;
    vector<int> adj(n, 0);
    for (const auto& e : edges) {
        adj[e.first] |= (1 << e.second);
        adj[e.second] |= (1 << e.first);
    }
    vector<int> dist(1 << n, -1);
    deque<int> q;
    q.push_back(full);
    dist[full] = 0;

    while (!q.empty()) {
        const int s = q.front();
        q.pop_front();
        if (s == 0) {
            return true;
        }
        if (dist[s] >= lim) {
            continue;
        }
        for (int v = 0; v < n; ++v) {
            const int s2 = s & ~(1 << v);
            int ns = 0;
            int x = s2;
            while (x) {
                const int b = x & -x;
                const int i = __builtin_ctz(static_cast<unsigned>(b));
                x -= b;
                ns |= adj[i];
            }
            if (dist[ns] == -1) {
                dist[ns] = dist[s] + 1;
                q.push_back(ns);
            }
        }
    }
    return false;
}

static bool is_bipartite(const int n, const vector<pair<int, int>>& edges) {
    vector<vector<int>> g(n);
    for (const auto& e : edges) {
        g[e.first].push_back(e.second);
        g[e.second].push_back(e.first);
    }
    vector<int> col(n, -1);
    deque<int> q;
    for (int s = 0; s < n; ++s) {
        if (col[s] != -1) {
            continue;
        }
        col[s] = 0;
        q.push_back(s);
        while (!q.empty()) {
            const int u = q.front();
            q.pop_front();
            for (const int v : g[u]) {
                if (col[v] == -1) {
                    col[v] = col[u] ^ 1;
                    q.push_back(v);
                } else if (col[v] == col[u]) {
                    return false;
                }
            }
        }
    }
    return true;
}

int main() {
    for (int n = 2; n <= 8; ++n) {
        vector<pair<int, int>> all_edges;
        for (int i = 0; i < n; ++i) {
            for (int j = i + 1; j < n; ++j) {
                all_edges.push_back({i, j});
            }
        }
        int tested = 0;
        int mismatch = 0;
        for (int mask = 1; mask < (1 << static_cast<int>(all_edges.size())); ++mask) {
            vector<pair<int, int>> edges;
            vector<int> deg(n, 0);
            for (int i = 0; i < static_cast<int>(all_edges.size()); ++i) {
                if ((mask >> i) & 1) {
                    edges.push_back(all_edges[i]);
                    ++deg[all_edges[i].first];
                    ++deg[all_edges[i].second];
                }
            }
            if (*min_element(deg.begin(), deg.end()) == 0) {
                continue;
            }
            ++tested;
            const bool s = solvable(n, edges, 10 * n);
            const bool b = is_bipartite(n, edges);
            if (s != b) {
                ++mismatch;
            }
        }
        cout << "n=" << n << " tested=" << tested << " mismatch=" << mismatch << '\n';
    }
    return 0;
}
