#include <bits/stdc++.h>
using namespace std;

namespace {
constexpr long long INF = (1LL << 62);

long long evaluate_target(
    const vector<vector<int>>& graph,
    const vector<int>& partition,
    const vector<int>& initial_red,
    int n,
    int target_red_for_partition_zero
) {
    const int total_red = accumulate(initial_red.begin(), initial_red.end(), 0);
    const int part0_count = count(partition.begin(), partition.end(), 0);
    const int part1_count = n - part0_count;

    const int target_total_red = (target_red_for_partition_zero == 1) ? part0_count : part1_count;
    if (target_total_red != total_red) {
        return INF;
    }

    vector<int> parent(n, -1);
    vector<int> order;
    order.reserve(n);

    stack<int> st;
    st.push(0);
    parent[0] = 0;

    while (!st.empty()) {
        int node = st.top();
        st.pop();
        order.push_back(node);
        for (int nxt : graph[node]) {
            if (parent[nxt] != -1) {
                continue;
            }
            parent[nxt] = node;
            st.push(nxt);
        }
    }

    vector<long long> balance(n, 0LL);
    long long cost = 0LL;

    for (int idx = n - 1; idx >= 0; --idx) {
        int node = order[idx];
        const int target_red = (partition[node] == 0) ? target_red_for_partition_zero : (1 - target_red_for_partition_zero);
        balance[node] += static_cast<long long>(initial_red[node] - target_red);

        if (node != 0) {
            cost += llabs(balance[node]);
            balance[parent[node]] += balance[node];
        }
    }

    if (balance[0] != 0) {
        return INF;
    }

    return cost;
}
}  // namespace

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 0;
    cin >> n;

    string colors;
    cin >> colors;

    vector<vector<int>> graph(n);
    for (int i = 0; i < n - 1; ++i) {
        int u = 0;
        int v = 0;
        cin >> u >> v;
        --u;
        --v;
        graph[u].push_back(v);
        graph[v].push_back(u);
    }

    vector<int> partition(n, -1);
    queue<int> q;
    partition[0] = 0;
    q.push(0);

    while (!q.empty()) {
        int node = q.front();
        q.pop();
        for (int nxt : graph[node]) {
            if (partition[nxt] != -1) {
                continue;
            }
            partition[nxt] = partition[node] ^ 1;
            q.push(nxt);
        }
    }

    vector<int> initial_red(n, 0);
    for (int i = 0; i < n; ++i) {
        initial_red[i] = (colors[i] == 'R') ? 1 : 0;
    }

    const long long option0 = evaluate_target(graph, partition, initial_red, n, 1);
    const long long option1 = evaluate_target(graph, partition, initial_red, n, 0);

    const long long answer = min(option0, option1);
    cout << (answer >= INF ? -1 : answer) << '\n';

    return 0;
}
