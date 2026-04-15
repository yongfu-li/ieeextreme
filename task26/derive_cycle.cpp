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
    for (const auto& e : edges) adj[e.first] |= (1 << e.second), adj[e.second] |= (1 << e.first);
    vector<int> dist(1 << n, -1);
    deque<int> q;
    q.push_back(full);
    dist[full] = 0;
    while (!q.empty()) {
        const int s = q.front();
        q.pop_front();
        if (s == 0) return true;
        if (dist[s] >= lim) continue;
        for (int v = 0; v < n; ++v) {
            const int s2 = s & ~(1 << v);
            int ns = 0, x = s2;
            while (x) {
                const int b = x & -x;
                const int i = __builtin_ctz(static_cast<unsigned>(b));
                x -= b;
                ns |= adj[i];
            }
            if (dist[ns] == -1) dist[ns] = dist[s] + 1, q.push_back(ns);
        }
    }
    return false;
}

static bool is_forest(const int n, const vector<pair<int, int>>& edges) {
    vector<int> p(n);
    iota(p.begin(), p.end(), 0);
    auto f = [&](auto&& self, int x) -> int {
        return p[x] == x ? x : p[x] = self(self, p[x]);
    };
    for (const auto& e : edges) {
        int a = f(f, e.first), b = f(f, e.second);
        if (a == b) return false;
        p[a] = b;
    }
    return true;
}

int main() {
    for (int n = 2; n <= 7; ++n) {
        vector<pair<int, int>> all_edges;
        for (int i = 0; i < n; ++i) for (int j = i + 1; j < n; ++j) all_edges.push_back({i, j});
        int tested = 0, mismatch = 0;
        for (int mask = 1; mask < (1 << static_cast<int>(all_edges.size())); ++mask) {
            vector<pair<int, int>> edges;
            vector<int> deg(n, 0);
            for (int i = 0; i < static_cast<int>(all_edges.size()); ++i) if ((mask >> i) & 1) {
                edges.push_back(all_edges[i]);
                ++deg[all_edges[i].first];
                ++deg[all_edges[i].second];
            }
            if (*min_element(deg.begin(), deg.end()) == 0) continue;
            ++tested;
            const bool s = solvable(n, edges, 10 * n);
            const bool f = is_forest(n, edges);
            if (s != f) ++mismatch;
        }
        cout << "n=" << n << " tested=" << tested << " mismatch=" << mismatch << '\n';
    }
}
