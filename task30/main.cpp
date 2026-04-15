#include <algorithm>
#include <array>
#include <iostream>
#include <limits>
#include <vector>

using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 0;
    cin >> n;

    vector<vector<int>> graph(n + 1);
    for (int i = 0; i < n - 1; ++i) {
        int u = 0;
        int v = 0;
        cin >> u >> v;
        graph[u].push_back(v);
        graph[v].push_back(u);
    }

    vector<int> parent(n + 1, 0);
    vector<int> order;
    order.reserve(n);
    vector<int> stack = {1};
    parent[1] = -1;

    while (!stack.empty()) {
        const int node = stack.back();
        stack.pop_back();
        order.push_back(node);
        for (const int neighbor : graph[node]) {
            if (neighbor == parent[node]) {
                continue;
            }
            parent[neighbor] = node;
            stack.push_back(neighbor);
        }
    }

    const long long NEG_INF = numeric_limits<long long>::lowest() / 4;

    // dp[node][state]:
    // state 0: no exposed Alex node towards parent.
    // state 1: exactly one exposed Alex node towards parent, and it is not node.
    // state 2: exactly one exposed Alex node towards parent, and it is node.
    vector<array<long long, 3>> dp(n + 1, {NEG_INF, NEG_INF, NEG_INF});

    for (int idx = n - 1; idx >= 0; --idx) {
        const int node = order[idx];
        vector<int> children;
        children.reserve(graph[node].size());
        for (const int neighbor : graph[node]) {
            if (neighbor != parent[node]) {
                children.push_back(neighbor);
            }
        }

        if (children.empty()) {
            dp[node][0] = 0;
            dp[node][1] = NEG_INF;
            dp[node][2] = 0;
            continue;
        }

        long long sum_zero = 0;
        bool valid_sum_zero = true;
        vector<long long> deltas;
        deltas.reserve(children.size());

        for (const int child : children) {
            if (dp[child][0] <= NEG_INF / 2) {
                valid_sum_zero = false;
            } else {
                sum_zero += dp[child][0];
            }
            const long long child_three = max(dp[child][1], dp[child][2]);
            deltas.push_back(child_three - dp[child][0]);
        }

        // dp[node][0]:
        // Option A: Ben does not take node.
        long long best_zero = valid_sum_zero ? sum_zero : NEG_INF;

        // Option B: Ben takes node, requiring at least two child subtrees to expose.
        if (valid_sum_zero && static_cast<int>(children.size()) >= 2) {
            sort(deltas.begin(), deltas.end(), greater<long long>());
            long long option_b = NEG_INF;
            if (deltas[1] > NEG_INF / 2) {
                long long sum_positive = 0;
                int positive_count = 0;
                for (const long long delta : deltas) {
                    if (delta > 0) {
                        sum_positive += delta;
                        ++positive_count;
                    }
                }
                if (positive_count >= 2) {
                    option_b = sum_zero + sum_positive + 1;
                } else if (positive_count == 1) {
                    option_b = sum_zero + deltas[0] + deltas[1] + 1;
                } else {
                    option_b = sum_zero + deltas[0] + deltas[1] + 1;
                }
            }
            best_zero = max(best_zero, option_b);
        }
        dp[node][0] = best_zero;

        // dp[node][1]:
        // Exactly one child contributes an exposed Alex node towards parent.
        long long best_one = NEG_INF;
        if (valid_sum_zero) {
            long long best_delta = NEG_INF;
            for (const long long delta : deltas) {
                best_delta = max(best_delta, delta);
            }
            if (best_delta > NEG_INF / 2) {
                best_one = sum_zero + best_delta;
            }
        }
        dp[node][1] = best_one;

        // dp[node][2]:
        // Node is chosen by Alex.
        long long best_two = 0;
        bool valid_two = true;
        for (const int child : children) {
            long long option_keep_closed = dp[child][0];
            long long option_with_cut = NEG_INF;
            if (dp[child][1] > NEG_INF / 2) {
                option_with_cut = dp[child][1] + 1;
            }
            const long long contribution = max(option_keep_closed, option_with_cut);
            if (contribution <= NEG_INF / 2) {
                valid_two = false;
                break;
            }
            best_two += contribution;
        }
        dp[node][2] = valid_two ? best_two : NEG_INF;
    }

    cout << max({dp[1][0], dp[1][1], dp[1][2]}) << '\n';
    return 0;
}
