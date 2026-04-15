#include <algorithm>
#include <iostream>
#include <queue>
#include <vector>

namespace {

std::pair<int, std::vector<int>> bfs_far(
    const std::vector<std::vector<int>>& g,
    const std::vector<int>& in_comp,
    const int src) {
    const int n = static_cast<int>(g.size());
    std::vector<int> d(n, -1), p(n, -1);
    std::queue<int> q;
    q.push(src);
    d[src] = 0;
    int far = src;
    while (!q.empty()) {
        const int u = q.front();
        q.pop();
        if (d[u] > d[far]) far = u;
        for (const int v : g[u]) {
            if (!in_comp[v] || d[v] != -1) continue;
            d[v] = d[u] + 1;
            p[v] = u;
            q.push(v);
        }
    }
    return {far, p};
}

std::vector<int> diameter_path(
    const std::vector<std::vector<int>>& g,
    const std::vector<int>& nodes,
    const std::vector<int>& in_comp) {
    const auto a = bfs_far(g, in_comp, nodes[0]);
    const auto b = bfs_far(g, in_comp, a.first);
    std::vector<int> path;
    for (int x = b.first; x != -1; x = b.second[x]) path.push_back(x);
    std::reverse(path.begin(), path.end());
    return path;
}

bool catches_component(
    const std::vector<std::vector<int>>& g,
    const std::vector<int>& nodes,
    const std::vector<int>& seq) {
    const int n = static_cast<int>(g.size());
    std::vector<int> in_comp(n, 0), alive(n, 0), mark(n, 0), touched;
    for (const int u : nodes) in_comp[u] = 1, alive[u] = 1;

    for (const int x : seq) {
        if (in_comp[x]) alive[x] = 0;
        touched.clear();
        for (const int u : nodes) if (alive[u]) {
            for (const int v : g[u]) {
                if (!in_comp[v] || mark[v]) continue;
                mark[v] = 1;
                touched.push_back(v);
            }
        }
        for (const int u : nodes) alive[u] = 0;
        for (const int v : touched) alive[v] = 1;
        for (const int v : touched) mark[v] = 0;
    }

    for (const int u : nodes) if (alive[u]) return false;
    return true;
}

void append_repeat(std::vector<int>* out, const std::vector<int>& base, const int times) {
    for (int t = 0; t < times; ++t) out->insert(out->end(), base.begin(), base.end());
}

std::vector<int> build_best_effort_component(
    const std::vector<std::vector<int>>& g,
    const std::vector<int>& nodes,
    const int global_n) {
    const int n = static_cast<int>(g.size());
    std::vector<int> in_comp(n, 0);
    for (const int u : nodes) in_comp[u] = 1;
    const std::vector<int> path = diameter_path(g, nodes, in_comp);

    std::vector<std::vector<int>> candidates;
    if (path.size() >= 2) {
        for (int len = 1; len < static_cast<int>(path.size()); ++len) {
            std::vector<int> pref(path.begin(), path.begin() + len);
            candidates.push_back(pref);
        }
        std::vector<int> pref(path.begin(), path.end() - 1);
        std::vector<int> internal;
        for (int i = 1; i + 1 < static_cast<int>(path.size()); ++i) internal.push_back(path[i]);
        candidates.push_back(pref);
        candidates.push_back(path);
        if (!internal.empty()) candidates.push_back(internal);
        std::vector<int> rev = path;
        std::reverse(rev.begin(), rev.end());
        for (int len = 1; len < static_cast<int>(rev.size()); ++len) {
            std::vector<int> pref_rev(rev.begin(), rev.begin() + len);
            candidates.push_back(pref_rev);
        }
    } else {
        candidates.push_back(path);
    }
    if (candidates.empty()) candidates.push_back({nodes[0]});

    std::vector<int> best;
    for (const auto& b : candidates) {
        if (b.empty()) continue;
        std::vector<int> seq;
        append_repeat(&seq, b, 2);
        if (catches_component(g, nodes, seq)) {
            if (best.empty() || seq.size() < best.size()) best = seq;
        }
        seq.clear();
        append_repeat(&seq, b, 3);
        if (catches_component(g, nodes, seq)) {
            if (best.empty() || seq.size() < best.size()) best = seq;
        }
        seq.clear();
        append_repeat(&seq, b, 4);
        if (catches_component(g, nodes, seq)) {
            if (best.empty() || seq.size() < best.size()) best = seq;
        }
        std::vector<int> revb = b;
        std::reverse(revb.begin(), revb.end());
        seq.clear();
        append_repeat(&seq, b, 1);
        append_repeat(&seq, revb, 1);
        append_repeat(&seq, b, 1);
        append_repeat(&seq, revb, 1);
        if (catches_component(g, nodes, seq)) {
            if (best.empty() || seq.size() < best.size()) best = seq;
        }
    }
    if (!best.empty() && static_cast<int>(best.size()) < 10 * global_n) return best;
    return {};
}

}  // namespace

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n = 0, m = 0;
    std::cin >> n >> m;
    std::vector<std::vector<int>> g(n);
    for (int i = 0; i < m; ++i) {
        int u = 0, v = 0;
        std::cin >> u >> v;
        --u; --v;
        g[u].push_back(v);
        g[v].push_back(u);
    }

    std::vector<int> comp_id(n, -1);
    std::vector<std::vector<int>> comps;
    for (int s = 0; s < n; ++s) if (comp_id[s] == -1) {
        std::queue<int> q;
        q.push(s);
        comp_id[s] = static_cast<int>(comps.size());
        comps.push_back({});
        while (!q.empty()) {
            const int u = q.front();
            q.pop();
            comps.back().push_back(u);
            for (const int v : g[u]) if (comp_id[v] == -1) {
                comp_id[v] = comp_id[s];
                q.push(v);
            }
        }
    }

    std::vector<int> ans;
    for (const auto& nodes : comps) {
        long long edge_sum = 0;
        for (const int u : nodes) edge_sum += static_cast<long long>(g[u].size());
        edge_sum /= 2;
        if (edge_sum != static_cast<long long>(nodes.size()) - 1) {
            std::cout << -1 << '\n';
            return 0;
        }
        const std::vector<int> part = build_best_effort_component(g, nodes, n);
        if (part.empty()) {
            std::cout << -1 << '\n';
            return 0;
        }
        ans.insert(ans.end(), part.begin(), part.end());
        if (static_cast<int>(ans.size()) >= 10 * n) {
            std::cout << -1 << '\n';
            return 0;
        }
    }

    if (ans.empty()) {
        std::cout << -1 << '\n';
        return 0;
    }
    std::cout << ans.size() << '\n';
    for (int i = 0; i < static_cast<int>(ans.size()); ++i) {
        std::cout << (ans[i] + 1) << (i + 1 == static_cast<int>(ans.size()) ? '\n' : ' ');
    }
    return 0;
}
