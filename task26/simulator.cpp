#include <iostream>
#include <vector>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n = 0;
    int m = 0;
    std::cin >> n >> m;

    std::vector<std::vector<int>> graph(n);
    for (int i = 0; i < m; ++i) {
        int u = 0;
        int v = 0;
        std::cin >> u >> v;
        --u;
        --v;
        graph[u].push_back(v);
        graph[v].push_back(u);
    }

    int k = 0;
    std::cin >> k;
    std::vector<int> sequence(k, 0);
    for (int i = 0; i < k; ++i) {
        std::cin >> sequence[i];
        --sequence[i];
    }

    std::vector<int> possible(n, 1);
    std::vector<int> next_possible(n, 0);

    for (const int x : sequence) {
        // Day check: thief cannot be at inspected node at this instant.
        if (x >= 0 && x < n) {
            possible[x] = 0;
        }

        // Night move: thief must move to a neighbor.
        for (int i = 0; i < n; ++i) {
            next_possible[i] = 0;
        }
        for (int u = 0; u < n; ++u) {
            if (!possible[u]) {
                continue;
            }
            for (const int v : graph[u]) {
                next_possible[v] = 1;
            }
        }
        possible.swap(next_possible);
    }

    int remaining = 0;
    for (const int x : possible) {
        remaining += x;
    }

    if (remaining == 0) {
        std::cout << "GUARANTEED\n";
    } else {
        std::cout << "NOT_GUARANTEED " << remaining << '\n';
    }

    return 0;
}
